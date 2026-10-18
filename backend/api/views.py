import math
import io
import qrcode
from django.core.files.base import ContentFile
from django.utils import timezone
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action

from .models import (
    CustomUser, MedicalCenter, DoctorProfile, AssistantProfile, PatientProfile,
    DoctorPatientAccess, Appointment, Conversation, Message,
    Prescription, Notification,
)
from django.db.models import Q
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    UserSerializer, UserProfileSerializer, AdminUserSerializer,
    CustomTokenObtainPairSerializer,
    MedicalCenterSerializer, DoctorProfileSerializer, DoctorListSerializer,
    AssistantProfileSerializer, PatientProfileSerializer,
    DoctorPatientAccessSerializer, AppointmentSerializer,
    ConversationSerializer, MessageSerializer,
    PrescriptionSerializer, NotificationSerializer,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def create_notification(user, title, body, notif_type='general'):
    """Create a Notification record for a user."""
    Notification.objects.create(user=user, title=title, body=body, notif_type=notif_type)


def haversine_distance(lat1, lon1, lat2, lon2):
    """Return distance in kilometres between two lat/lon points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def is_admin(user):
    return user.role == 'admin'


def is_doctor(user):
    return user.role == 'doctor'


def is_patient(user):
    return user.role == 'patient'


def is_assistant(user):
    return user.role == 'assistant'


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class CustomTokenObtainPairView(TokenObtainPairView):
    """Obtain token with either username or email, returns enriched payload."""
    permission_classes = (AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """Register a new user and create the matching role profile."""
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        if user.role == 'patient':
            PatientProfile.objects.get_or_create(user=user)
        elif user.role == 'doctor':
            DoctorProfile.objects.get_or_create(user=user)
        elif user.role == 'assistant':
            AssistantProfile.objects.get_or_create(user=user)

        create_notification(
            user,
            'Welcome to DocConnect!',
            f'Hello {user.first_name or user.username}, your {user.role} profile is now active.',
            'general'
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Return and update the authenticated user's own profile."""
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        data = UserProfileSerializer(user, context={'request': request}).data

        # Attach role-specific sub-profile
        if user.role == 'doctor' and hasattr(user, 'doctor_profile'):
            data['doctor_profile'] = DoctorProfileSerializer(
                user.doctor_profile, context={'request': request}
            ).data
        elif user.role == 'patient' and hasattr(user, 'patient_profile'):
            data['patient_profile'] = PatientProfileSerializer(
                user.patient_profile, context={'request': request}
            ).data
        elif user.role == 'assistant' and hasattr(user, 'assistant_profile'):
            data['assistant_profile'] = AssistantProfileSerializer(
                user.assistant_profile, context={'request': request}
            ).data

        return Response(data)

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        super().update(request, *args, **kwargs)
        user = self.get_object()
        if user.role == 'patient':
            pp, _ = PatientProfile.objects.get_or_create(user=user)
            for field in ['blood_group', 'allergies', 'medical_history', 'date_of_birth', 'emergency_contact_name', 'emergency_contact_phone']:
                if field in request.data:
                    val = request.data[field]
                    if field == 'date_of_birth' and (val == '' or val is None):
                        val = None
                    setattr(pp, field, val)
            pp.save()
        elif user.role == 'doctor':
            dp, _ = DoctorProfile.objects.get_or_create(user=user)
            for field in ['specialization', 'experience_years', 'consultation_fee', 'bio', 'license_number', 'is_accepting_patients', 'available_days', 'assistant_can_approve']:
                if field in request.data:
                    val = request.data[field]
                    setattr(dp, field, val)
            dp.save()

        return self.retrieve(request, *args, **kwargs)


# ---------------------------------------------------------------------------
# Medical Centers (admin only)
# ---------------------------------------------------------------------------

class IsAdminRole(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'admin'


class MedicalCenterViewSet(viewsets.ModelViewSet):
    queryset = MedicalCenter.objects.all()
    serializer_class = MedicalCenterSerializer
    permission_classes = (IsAdminRole,)


# ---------------------------------------------------------------------------
# Doctors
# ---------------------------------------------------------------------------

class DoctorListView(generics.ListAPIView):
    """List doctors with optional filters. Supports location-based ordering."""
    permission_classes = (IsAuthenticated,)
    serializer_class = DoctorListSerializer

    def get_queryset(self):
        qs = DoctorProfile.objects.select_related('user', 'medical_center').all()
        params = self.request.query_params

        spec = params.get('specialization')
        if spec:
            qs = qs.filter(specialization=spec)

        min_fee = params.get('min_fee')
        if min_fee:
            qs = qs.filter(consultation_fee__gte=min_fee)

        max_fee = params.get('max_fee')
        if max_fee:
            qs = qs.filter(consultation_fee__lte=max_fee)

        name = params.get('name')
        if name:
            qs = qs.filter(user__first_name__icontains=name) | qs.filter(user__last_name__icontains=name)

        return qs

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        distances = {}

        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')

        if lat and lon:
            try:
                user_lat, user_lon = float(lat), float(lon)
                for doctor in qs:
                    if doctor.user.latitude is not None and doctor.user.longitude is not None:
                        dist = haversine_distance(
                            user_lat, user_lon,
                            doctor.user.latitude, doctor.user.longitude
                        )
                        distances[doctor.pk] = round(dist, 2)
                    else:
                        distances[doctor.pk] = None

                # Order by distance (None last)
                qs = sorted(qs, key=lambda d: (distances.get(d.pk) is None, distances.get(d.pk) or 0))
            except (ValueError, TypeError):
                pass

        serializer = DoctorListSerializer(qs, many=True, context={'request': request, 'distances': distances})
        return Response(serializer.data)


class DoctorDetailView(generics.RetrieveAPIView):
    queryset = DoctorProfile.objects.select_related('user', 'medical_center').all()
    serializer_class = DoctorProfileSerializer
    permission_classes = (IsAuthenticated,)


# ---------------------------------------------------------------------------
# Doctor Profile Update
# ---------------------------------------------------------------------------

class DoctorProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = DoctorProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        if not is_doctor(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only doctors can access this endpoint.")
        return self.request.user.doctor_profile


# ---------------------------------------------------------------------------
# Assistant Profile
# ---------------------------------------------------------------------------

class AssistantProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = AssistantProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        if not is_assistant(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only assistants can access this endpoint.")
        return self.request.user.assistant_profile


class AssistantListView(APIView):
    """List all registered medical assistants for doctors to appoint."""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        assistants = AssistantProfile.objects.select_related('user', 'medical_center').all()
        data = [
            {
                'id': a.id,
                'user_id': a.user.id,
                'username': a.user.username,
                'name': a.user.get_full_name() or a.user.username,
                'email': a.user.email,
                'phone': a.user.phone,
                'medical_center': a.medical_center.name if a.medical_center else None,
                'doctors_count': a.doctors.count(),
            }
            for a in assistants
        ]
        return Response(data)


class AssistantAssignDoctorView(APIView):
    """
    Doctor assigns an assistant to themselves, or removes their current assistant.
    Accepts assistant_user_id (integer ID or username string), or action='remove'.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        if not is_doctor(user):
            return Response({'error': 'Only doctors can appoint assistants.'}, status=403)

        doctor_profile = user.doctor_profile
        action = request.data.get('action')
        remove = request.data.get('remove', False)

        if action == 'remove' or remove:
            old_asst = doctor_profile.assistant
            doctor_profile.assistant = None
            doctor_profile.save()
            if old_asst:
                create_notification(
                    old_asst.user,
                    'Assistant Appointment Ended',
                    f'Dr. {user.get_full_name()} has unassigned you as their assistant.',
                    'general',
                )
            return Response({'message': 'Assistant removed successfully.', 'assistant': None})

        assistant_ident = str(request.data.get('assistant_user_id') or request.data.get('assistant_id') or '').strip()
        if not assistant_ident:
            return Response({'error': 'Please provide an assistant ID or username.'}, status=400)

        assistant_profile = None
        if assistant_ident.isdigit():
            assistant_profile = AssistantProfile.objects.filter(
                Q(user_id=int(assistant_ident)) | Q(id=int(assistant_ident))
            ).first()
        if not assistant_profile:
            assistant_profile = AssistantProfile.objects.filter(
                user__username__iexact=assistant_ident
            ).first()

        if not assistant_profile:
            return Response({'error': f'Assistant "{assistant_ident}" not found.'}, status=404)

        # Appoint assistant to this doctor
        doctor_profile.assistant = assistant_profile
        doctor_profile.save()

        create_notification(
            assistant_profile.user,
            'Doctor Appointment',
            f'Dr. {user.get_full_name()} has appointed you as their clinical assistant.',
            'general',
        )

        return Response({
            'message': 'Assistant appointed successfully.',
            'assistant': {
                'id': assistant_profile.id,
                'user_id': assistant_profile.user.id,
                'username': assistant_profile.user.username,
                'name': assistant_profile.user.get_full_name() or assistant_profile.user.username,
                'email': assistant_profile.user.email,
                'phone': assistant_profile.user.phone,
            }
        })


# ---------------------------------------------------------------------------
# Patient Profile
# ---------------------------------------------------------------------------

class PatientProfileUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = PatientProfileSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        if not is_patient(self.request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only patients can access this endpoint.")
        return self.request.user.patient_profile


# ---------------------------------------------------------------------------
# Doctor–Patient Access
# ---------------------------------------------------------------------------

class RequestAccessView(APIView):
    """Patient requests access to a doctor."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if not is_patient(request.user):
            return Response({'error': 'Only patients can request consultation access.'}, status=403)

        doctor_id = request.data.get('doctor_id')
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found.'}, status=404)

        existing = DoctorPatientAccess.objects.filter(doctor=doctor, patient=request.user).first()
        if existing and existing.status in ['approved', 'pending']:
            if existing.status == 'approved':
                return Response({'error': 'You already have approved consultation access with this doctor.', 'status': 'approved'}, status=400)
            return Response({'error': 'Your consultation request is already pending review.', 'status': 'pending'}, status=400)

        has_assistant = doctor.assistant is not None
        if has_assistant:
            access, _ = DoctorPatientAccess.objects.update_or_create(
                doctor=doctor,
                patient=request.user,
                defaults={
                    'status': 'pending',
                    'can_message': False,
                    'assistant_permission_granted': doctor.assistant_can_approve,
                }
            )
            # Notify assistant
            create_notification(
                doctor.assistant.user,
                'New Patient Consultation Request',
                f'{request.user.get_full_name()} has requested consultation with Dr. {doctor.user.get_full_name()}.',
                'access',
            )
        else:
            # Auto-approve when doctor has no assistant (handled directly)
            access, _ = DoctorPatientAccess.objects.update_or_create(
                doctor=doctor,
                patient=request.user,
                defaults={
                    'status': 'approved',
                    'can_message': True,
                    'approved_by': doctor.user,
                    'assistant_permission_granted': True,
                }
            )
            Conversation.objects.get_or_create(doctor=doctor, patient=request.user)
            create_notification(
                doctor.user,
                'New Direct Patient Consultation',
                f'{request.user.get_full_name()} has connected directly for consultation.',
                'access',
            )

        serializer = DoctorPatientAccessSerializer(access)
        return Response(serializer.data, status=201)


class GrantAssistantPermissionView(APIView):
    """Doctor grants or revokes assistant permission to approve patients."""
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        if not is_doctor(request.user):
            return Response({'error': 'Only doctors can use this endpoint.'}, status=403)

        grant = request.data.get('grant', True)
        if isinstance(grant, str):
            grant = grant.lower() in ['true', '1', 'yes']

        doctor = request.user.doctor_profile
        doctor.assistant_can_approve = bool(grant)
        doctor.save()

        DoctorPatientAccess.objects.filter(doctor=doctor).update(
            assistant_permission_granted=bool(grant)
        )
        return Response({
            'message': f'Assistant permission {"granted" if grant else "revoked"}.',
            'assistant_can_approve': doctor.assistant_can_approve,
        })


class AssistantApproveAccessView(APIView):
    """Assistant approves or rejects a patient access request for their doctor."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, access_id):
        if not is_assistant(request.user):
            return Response({'error': 'Only assistants can approve consultation requests.'}, status=403)

        try:
            assistant_profile = request.user.assistant_profile
        except AssistantProfile.DoesNotExist:
            return Response({'error': 'Assistant profile not found.'}, status=404)

        try:
            access = DoctorPatientAccess.objects.get(id=access_id)
        except DoctorPatientAccess.DoesNotExist:
            return Response({'error': 'Access record not found.'}, status=404)

        # Verify this assistant is assigned to the doctor
        if access.doctor.assistant != assistant_profile:
            return Response({'error': 'You are not the appointed assistant for this doctor.'}, status=403)

        decision = request.data.get('decision')  # 'approve' or 'reject'
        if decision == 'approve':
            if not access.assistant_permission_granted and not access.doctor.assistant_can_approve:
                return Response({
                    'error': f'Dr. {access.doctor.user.get_full_name()} has not granted permission to approve patient consultations.'
                }, status=403)

            access.status = 'approved'
            access.can_message = True
            access.approved_by = request.user
            access.save()
            Conversation.objects.get_or_create(doctor=access.doctor, patient=access.patient)
            create_notification(
                access.patient,
                'Consultation Approved',
                f'Your consultation request with Dr. {access.doctor.user.get_full_name()} has been approved. You can now message and book appointments.',
                'access',
            )
        elif decision == 'reject':
            access.status = 'rejected'
            access.can_message = False
            access.approved_by = request.user
            access.save()
            create_notification(
                access.patient,
                'Consultation Request Rejected',
                f'Your consultation request with Dr. {access.doctor.user.get_full_name()} was declined.',
                'access',
            )
        else:
            return Response({'error': 'Invalid decision. Use "approve" or "reject".'}, status=400)

        serializer = DoctorPatientAccessSerializer(access)
        return Response(serializer.data)


class PatientAccessListView(generics.ListAPIView):
    """List access records filtered by the caller's role."""
    serializer_class = DoctorPatientAccessSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if is_doctor(user):
            return DoctorPatientAccess.objects.filter(doctor=user.doctor_profile)
        elif is_patient(user):
            return DoctorPatientAccess.objects.filter(patient=user)
        elif is_assistant(user):
            profile = getattr(user, 'assistant_profile', None)
            if profile:
                return DoctorPatientAccess.objects.filter(doctor__assistant=profile)
        elif is_admin(user):
            return DoctorPatientAccess.objects.all()
        return DoctorPatientAccess.objects.none()


# ---------------------------------------------------------------------------
# Appointments
# ---------------------------------------------------------------------------

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if is_patient(user):
            return Appointment.objects.filter(patient=user)
        elif is_doctor(user):
            return Appointment.objects.filter(doctor=user.doctor_profile)
        elif is_assistant(user):
            profile = getattr(user, 'assistant_profile', None)
            if profile:
                return Appointment.objects.filter(doctor__assistant=profile)
        elif is_admin(user):
            return Appointment.objects.all()
        return Appointment.objects.none()

    def create(self, request, *args, **kwargs):
        if not is_patient(request.user):
            return Response({'error': 'Only patients can create appointments.'}, status=403)

        doctor_id = request.data.get('doctor')
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except (DoctorProfile.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Doctor not found.'}, status=404)

        has_assistant = doctor.assistant is not None
        initial_status = 'pending_assistant' if has_assistant else 'requested'
        assistant = doctor.assistant if has_assistant else None

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save(
            patient=request.user,
            doctor=doctor,
            assistant=assistant,
            status=initial_status,
        )

        # Notifications
        if has_assistant:
            create_notification(
                assistant.user,
                'New Appointment Request',
                f'{request.user.get_full_name()} has requested an appointment with Dr. {doctor.user.get_full_name()}.',
                'appointment',
            )
        else:
            create_notification(
                doctor.user,
                'New Appointment Request',
                f'{request.user.get_full_name()} has requested an appointment.',
                'appointment',
            )

        return Response(self.get_serializer(appointment).data, status=201)

    def update(self, request, *args, **kwargs):
        appointment = self.get_object()
        new_status = request.data.get('status')
        if new_status and new_status in ['requested', 'pending_assistant', 'approved', 'rejected', 'completed', 'cancelled']:
            appointment.status = new_status
            create_notification(
                appointment.patient,
                'Appointment Status Updated',
                f'Your appointment status was updated to {new_status}.',
                'appointment'
            )
        new_mode = request.data.get('mode')
        if new_mode and new_mode in ['in_person', 'video', 'phone']:
            appointment.mode = new_mode

        if 'scheduled_at' in request.data:
            appointment.scheduled_at = request.data['scheduled_at']
        if 'notes' in request.data:
            appointment.notes = request.data['notes']
        if 'patient_notes' in request.data:
            appointment.patient_notes = request.data['patient_notes']

        appointment.save()
        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_appointment(self, request, pk=None):
        """Assistant approves an appointment."""
        if not is_assistant(request.user):
            return Response({'error': 'Only assistants can approve appointments.'}, status=403)

        appointment = self.get_object()
        appointment.status = 'approved'
        appointment.approved_by_assistant = True
        appointment.approved_at = timezone.now()
        appointment.save()

        create_notification(
            appointment.patient,
            'Appointment Approved',
            f'Your appointment with Dr. {appointment.doctor.user.get_full_name()} has been approved.',
            'appointment',
        )
        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='status')
    def update_status(self, request, pk=None):
        """Doctor updates appointment status."""
        if not is_doctor(request.user):
            return Response({'error': 'Only doctors can update appointment status.'}, status=403)

        appointment = self.get_object()
        if appointment.doctor != request.user.doctor_profile:
            return Response({'error': 'Permission denied.'}, status=403)

        new_status = request.data.get('status')
        allowed = ['approved', 'rejected', 'completed', 'cancelled']
        if new_status not in allowed:
            return Response({'error': f'Status must be one of {allowed}.'}, status=400)

        appointment.status = new_status
        appointment.save()

        create_notification(
            appointment.patient,
            'Appointment Update',
            f'Your appointment status has been updated to "{new_status}".',
            'appointment',
        )
        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='mode')
    def update_mode(self, request, pk=None):
        """Doctor or patient updates appointment mode."""
        appointment = self.get_object()
        user = request.user

        if not (
            (is_doctor(user) and appointment.doctor == user.doctor_profile)
            or (is_patient(user) and appointment.patient == user)
        ):
            return Response({'error': 'Permission denied.'}, status=403)

        mode = request.data.get('mode')
        allowed_modes = ['in_person', 'video', 'phone']
        if mode not in allowed_modes:
            return Response({'error': f'Mode must be one of {allowed_modes}.'}, status=400)

        appointment.mode = mode
        appointment.save()
        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_appointment(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        create_notification(
            appointment.doctor.user,
            'Appointment Cancelled',
            f'Appointment with {appointment.patient.get_full_name()} was cancelled.',
            'appointment'
        )
        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_appointment(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'rejected'
        appointment.save()
        create_notification(
            appointment.patient,
            'Appointment Rejected',
            f'Your appointment with Dr. {appointment.doctor.user.get_full_name()} was rejected.',
            'appointment'
        )
        return Response(self.get_serializer(appointment).data)

    @action(detail=True, methods=['post'], url_path='complete')
    def complete_appointment(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.save()
        create_notification(
            appointment.patient,
            'Appointment Completed',
            f'Your appointment with Dr. {appointment.doctor.user.get_full_name()} has been marked completed.',
            'appointment'
        )
        return Response(self.get_serializer(appointment).data)


# ---------------------------------------------------------------------------
# Conversations & Messages
# ---------------------------------------------------------------------------

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if is_patient(user):
            return Conversation.objects.filter(patient=user)
        elif is_doctor(user):
            return Conversation.objects.filter(doctor=user.doctor_profile)
        elif is_assistant(user):
            profile = getattr(user, 'assistant_profile', None)
            if profile:
                return Conversation.objects.filter(doctor__assistant=profile)
        elif is_admin(user):
            return Conversation.objects.all()
        return Conversation.objects.none()

    def create(self, request, *args, **kwargs):
        """Initiate or retrieve a conversation between an approved doctor and patient."""
        user = request.user
        if is_patient(user):
            doctor_id = request.data.get('doctor')
            try:
                doctor = DoctorProfile.objects.get(id=doctor_id)
            except (DoctorProfile.DoesNotExist, ValueError, TypeError):
                return Response({'error': 'Doctor not found.'}, status=404)

            try:
                access = DoctorPatientAccess.objects.get(doctor=doctor, patient=user)
            except DoctorPatientAccess.DoesNotExist:
                return Response({'error': 'You do not have access to this doctor.'}, status=403)

            if not access.can_message:
                return Response({'error': 'Messaging is not permitted yet. Consultation access must be approved first.'}, status=403)

            conv, created = Conversation.objects.get_or_create(doctor=doctor, patient=user)
            return Response(ConversationSerializer(conv, context={'request': request}).data, status=201 if created else 200)

        elif is_doctor(user):
            patient_id = request.data.get('patient')
            try:
                patient = User.objects.get(id=patient_id)
            except (User.DoesNotExist, ValueError, TypeError):
                return Response({'error': 'Patient not found.'}, status=404)

            doctor = user.doctor_profile
            try:
                access = DoctorPatientAccess.objects.get(doctor=doctor, patient=patient)
            except DoctorPatientAccess.DoesNotExist:
                return Response({'error': 'You do not have access for this patient.'}, status=403)

            if not access.can_message:
                return Response({'error': 'Consultation access is not approved for messaging.'}, status=403)

            conv, created = Conversation.objects.get_or_create(doctor=doctor, patient=patient)
            return Response(ConversationSerializer(conv, context={'request': request}).data, status=201 if created else 200)

        return Response({'error': 'Only patients or doctors can initiate conversations.'}, status=403)


class MessageListView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        user = self.request.user
        try:
            conv = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Message.objects.none()

        # Only participants can view messages
        is_participant = (conv.patient == user or conv.doctor.user == user)
        if not is_participant:
            return Message.objects.none()

        return Message.objects.filter(conversation=conv).order_by('created_at')

    def perform_create(self, serializer):
        conversation_id = self.kwargs['conversation_id']
        conv = Conversation.objects.get(id=conversation_id)
        serializer.save(conversation=conv, sender=self.request.user)


# ---------------------------------------------------------------------------
# Prescriptions
# ---------------------------------------------------------------------------

def generate_qr_image(data: str) -> ContentFile:
    """Generate a QR code PNG and return as a Django ContentFile."""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color='black', back_color='white')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return ContentFile(buffer.read())


class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        if is_doctor(user):
            return Prescription.objects.filter(doctor=user.doctor_profile)
        elif is_patient(user):
            return Prescription.objects.filter(patient=user)
        elif is_assistant(user):
            profile = getattr(user, 'assistant_profile', None)
            if profile:
                return Prescription.objects.filter(
                    Q(doctor__assistant=profile) | Q(is_validated=False)
                ).distinct()
            return Prescription.objects.all()
        elif is_admin(user):
            return Prescription.objects.all()
        return Prescription.objects.none()

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    @action(detail=False, methods=['get'], url_path='unvalidated')
    def unvalidated(self, request):
        qs = self.get_queryset().filter(is_validated=False)
        return Response(self.get_serializer(qs, many=True).data)

    def create(self, request, *args, **kwargs):
        if not is_doctor(request.user):
            return Response({'error': 'Only doctors can create prescriptions.'}, status=403)

        patient_id = request.data.get('patient')
        if not patient_id:
            return Response({'error': 'Patient selection is required.'}, status=400)

        try:
            patient_user = CustomUser.objects.get(id=patient_id)
        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Selected patient was not found.'}, status=404)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prescription = serializer.save(
            doctor=request.user.doctor_profile,
            patient=patient_user,
        )

        # Generate QR code with UUID
        barcode_data = str(prescription.id)
        prescription.barcode_data = barcode_data
        image_content = generate_qr_image(barcode_data)
        prescription.barcode_image.save(
            f'qr_{barcode_data}.png', image_content, save=True
        )

        create_notification(
            prescription.patient,
            'New Prescription Issued',
            f'Dr. {request.user.get_full_name()} has issued you a new digital prescription.',
            'prescription',
        )

        return Response(self.get_serializer(prescription).data, status=201)

    @action(detail=False, methods=['post'], url_path='validate-barcode')
    def validate_barcode(self, request):
        """Assistant validates a prescription by scanning or submitting barcode_data."""
        if not is_assistant(request.user):
            return Response({'error': 'Only assistants can validate prescriptions.'}, status=403)

        barcode = (request.data.get('barcode_data') or request.data.get('barcode') or '').strip()
        if not barcode:
            return Response({'error': 'Please enter or scan a prescription barcode.'}, status=400)

        prescription = None
        try:
            prescription = Prescription.objects.filter(Q(id=barcode) | Q(barcode_data__iexact=barcode)).first()
        except Exception:
            prescription = Prescription.objects.filter(barcode_data__iexact=barcode).first()

        if not prescription:
            return Response({'error': f'No prescription found matching code "{barcode}".'}, status=404)

        if prescription.is_validated:
            validator_name = prescription.validated_by.get_full_name() if prescription.validated_by else 'an assistant'
            return Response({
                'error': f'Prescription already validated by {validator_name}.',
                'prescription': self.get_serializer(prescription).data,
            }, status=400)

        prescription.is_validated = True
        prescription.validated_by = request.user
        prescription.validated_at = timezone.now()
        prescription.save()

        create_notification(
            prescription.patient,
            'Prescription Validated',
            f'Your prescription issued by Dr. {prescription.doctor.user.get_full_name()} has been successfully validated.',
            'prescription',
        )

        return Response(self.get_serializer(prescription).data)

    @action(detail=True, methods=['post'], url_path='validate')
    def validate_prescription(self, request, pk=None):
        """Assistant validates a prescription by submitting barcode_data or directly by ID."""
        if not is_assistant(request.user):
            return Response({'error': 'Only assistants can validate prescriptions.'}, status=403)

        try:
            prescription = Prescription.objects.get(id=pk)
        except (Prescription.DoesNotExist, ValueError):
            return Response({'error': 'Prescription not found.'}, status=404)

        submitted = (request.data.get('barcode_data') or request.data.get('barcode') or '').strip()

        if prescription.is_validated:
            return Response({'error': 'Prescription already validated.'}, status=400)

        if submitted and submitted != str(prescription.id) and submitted.lower() != prescription.barcode_data.lower():
            return Response({'error': 'Invalid barcode data for this prescription.'}, status=400)

        prescription.is_validated = True
        prescription.validated_by = request.user
        prescription.validated_at = timezone.now()
        prescription.save()

        create_notification(
            prescription.patient,
            'Prescription Validated',
            f'Your prescription has been validated by {request.user.get_full_name()}.',
            'prescription',
        )

        return Response(self.get_serializer(prescription).data)

    @action(detail=True, methods=['get'], url_path='barcode')
    def get_barcode(self, request, pk=None):
        """Return the absolute URL of the prescription QR/barcode image."""
        prescription = self.get_object()
        if prescription.barcode_image:
            url = request.build_absolute_uri(prescription.barcode_image.url) if request else f"http://localhost:8000{prescription.barcode_image.url}"
            return Response({'barcode_image_url': url, 'barcode_data': prescription.barcode_data})
        return Response({'error': 'No barcode image found.'}, status=404)


# ---------------------------------------------------------------------------
# Admin Stats
# ---------------------------------------------------------------------------

class AdminStatsView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if not is_admin(request.user):
            return Response({'error': 'Admin access only.'}, status=403)

        from django.db.models import Count
        stats = {
            'users': {
                'total': CustomUser.objects.count(),
                'admin': CustomUser.objects.filter(role='admin').count(),
                'doctor': CustomUser.objects.filter(role='doctor').count(),
                'patient': CustomUser.objects.filter(role='patient').count(),
                'assistant': CustomUser.objects.filter(role='assistant').count(),
            },
            'appointments': {
                status_val: Appointment.objects.filter(status=status_val).count()
                for status_val in ['requested', 'pending_assistant', 'approved', 'rejected', 'completed', 'cancelled']
            },
            'appointments_total': Appointment.objects.count(),
            'prescriptions': {
                'total': Prescription.objects.count(),
                'validated': Prescription.objects.filter(is_validated=True).count(),
                'not_validated': Prescription.objects.filter(is_validated=False).count(),
            },
            'medical_centers': MedicalCenter.objects.count(),
        }
        return Response(stats)


class AdminUserViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserSerializer
    permission_classes = (IsAdminRole,)
    queryset = CustomUser.objects.all().order_by('-date_joined')

    def get_queryset(self):
        qs = super().get_queryset()
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        return qs


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class MarkNotificationReadView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        notif_id = request.data.get('id')
        if notif_id:
            # Mark single notification
            try:
                notif = Notification.objects.get(id=notif_id, user=request.user)
                notif.is_read = True
                notif.save()
                return Response({'message': 'Notification marked as read.'})
            except Notification.DoesNotExist:
                return Response({'error': 'Notification not found.'}, status=404)
        else:
            # Mark all
            Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
            return Response({'message': 'All notifications marked as read.'})
