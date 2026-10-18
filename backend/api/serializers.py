from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    MedicalCenter, DoctorProfile, AssistantProfile, PatientProfile,
    DoctorPatientAccess, Appointment, Conversation, Message,
    Prescription, Notification,
)

from django.db.models import Q
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth / Token Serializers
# ---------------------------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allow logging in with either username OR email,
    and embed role, username, email, and full name claims into the JWT token
    as well as in the response JSON payload.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field] = serializers.CharField(required=False)
        self.fields['email'] = serializers.CharField(required=False)

    def validate(self, attrs):
        username_or_email = (attrs.get(self.username_field) or attrs.get('email') or '').strip()
        password = attrs.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError({'detail': 'Username/email and password are required.'})

        user = User.objects.filter(
            Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)
        ).first()

        if user is None or not user.check_password(password):
            raise serializers.ValidationError({'detail': 'Invalid credentials. Please check your username/email and password.'})

        if not user.is_active:
            raise serializers.ValidationError({'detail': 'This account has been deactivated.'})

        self.user = user
        refresh = self.get_token(self.user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token


# ---------------------------------------------------------------------------
# User serializers
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """Used for registration. Password is write-only."""
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'password',
            'first_name', 'last_name', 'phone', 'address',
            'latitude', 'longitude',
        ]

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value.lower()

    def validate_username(self, value):
        if not value:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Full profile including profile_pic, for reading."""
    profile_pic = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role',
            'first_name', 'last_name', 'phone', 'address',
            'latitude', 'longitude', 'profile_pic',
        ]
        read_only_fields = ['id', 'username', 'email', 'role']


class UserBasicSerializer(serializers.ModelSerializer):
    """Minimal user info used as nested representation."""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone']


class AdminUserSerializer(serializers.ModelSerializer):
    """Full user representation for admin management."""
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role',
            'first_name', 'last_name', 'phone', 'address',
            'latitude', 'longitude', 'is_active', 'date_joined'
        ]


# ---------------------------------------------------------------------------
# Medical Center
# ---------------------------------------------------------------------------

class MedicalCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalCenter
        fields = '__all__'


# ---------------------------------------------------------------------------
# Doctor
# ---------------------------------------------------------------------------

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    assistant = serializers.SerializerMethodField()
    medical_center_name = serializers.CharField(
        source='medical_center.name', read_only=True, allow_null=True
    )

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'medical_center', 'medical_center_name',
            'specialization', 'experience_years', 'consultation_fee',
            'bio', 'available_days', 'available_from', 'available_to',
            'is_accepting_patients', 'license_number', 'assistant',
            'assistant_can_approve',
        ]

    def get_assistant(self, obj):
        if obj.assistant:
            return {
                'id': obj.assistant.id,
                'user_id': obj.assistant.user.id,
                'username': obj.assistant.user.username,
                'name': obj.assistant.user.get_full_name() or obj.assistant.user.username,
                'email': obj.assistant.user.email,
                'phone': obj.assistant.user.phone,
            }
        return None


class DoctorListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing doctors; includes computed distance and assistant info."""
    user = UserBasicSerializer(read_only=True)
    medical_center_name = serializers.CharField(
        source='medical_center.name', read_only=True, allow_null=True
    )
    distance = serializers.SerializerMethodField()
    has_assistant = serializers.SerializerMethodField()

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'medical_center', 'medical_center_name',
            'specialization', 'experience_years', 'consultation_fee',
            'is_accepting_patients', 'distance', 'has_assistant',
            'available_days', 'bio',
        ]

    def get_distance(self, obj):
        # Distance is injected by the view via context; default None
        distances = self.context.get('distances', {})
        return distances.get(obj.pk, None)

    def get_has_assistant(self, obj):
        return bool(obj.assistant_id)


# ---------------------------------------------------------------------------
# Assistant
# ---------------------------------------------------------------------------

class AssistantProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    doctor_info = serializers.SerializerMethodField()
    doctors = serializers.SerializerMethodField()

    class Meta:
        model = AssistantProfile
        fields = ['id', 'user', 'doctor_info', 'doctors', 'medical_center']

    def get_doctor_info(self, obj):
        doc = obj.doctor
        if doc:
            return {
                'id': doc.id,
                'name': doc.user.get_full_name() or doc.user.username,
                'specialization': doc.specialization,
                'assistant_can_approve': doc.assistant_can_approve,
            }
        return None

    def get_doctors(self, obj):
        return [
            {
                'id': d.id,
                'name': d.user.get_full_name() or d.user.username,
                'specialization': d.specialization,
                'assistant_can_approve': d.assistant_can_approve,
            }
            for d in obj.doctors.select_related('user').all()
        ]


# ---------------------------------------------------------------------------
# Patient
# ---------------------------------------------------------------------------

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'date_of_birth', 'blood_group',
            'allergies', 'medical_history',
            'emergency_contact_name', 'emergency_contact_phone',
        ]


# ---------------------------------------------------------------------------
# Doctor–Patient Access
# ---------------------------------------------------------------------------

class DoctorPatientAccessSerializer(serializers.ModelSerializer):
    patient_info = UserBasicSerializer(source='patient', read_only=True)
    doctor_info = serializers.SerializerMethodField()

    class Meta:
        model = DoctorPatientAccess
        fields = [
            'id', 'doctor', 'patient', 'patient_info', 'doctor_info',
            'status', 'approved_by', 'can_message',
            'assistant_permission_granted', 'created_at', 'updated_at',
        ]
        read_only_fields = ['status', 'approved_by', 'can_message', 'created_at', 'updated_at']

    def get_doctor_info(self, obj):
        return {
            'id': obj.doctor.id,
            'name': obj.doctor.user.get_full_name(),
            'specialization': obj.doctor.specialization,
        }


# ---------------------------------------------------------------------------
# Appointment
# ---------------------------------------------------------------------------

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_info = serializers.SerializerMethodField()
    patient_info = UserBasicSerializer(source='patient', read_only=True)
    assistant_info = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'doctor_info', 'patient', 'patient_info',
            'assistant', 'assistant_info', 'mode', 'status',
            'scheduled_at', 'notes', 'patient_notes',
            'approved_by_assistant', 'approved_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'patient', 'status', 'assistant', 'approved_by_assistant', 'approved_at',
            'created_at', 'updated_at',
        ]

    def get_doctor_info(self, obj):
        return {
            'id': obj.doctor.id,
            'name': obj.doctor.user.get_full_name(),
            'specialization': obj.doctor.specialization,
        }

    def get_assistant_info(self, obj):
        if obj.assistant:
            return {
                'id': obj.assistant.id,
                'name': obj.assistant.user.get_full_name(),
            }
        return None


# ---------------------------------------------------------------------------
# Conversation & Message
# ---------------------------------------------------------------------------

class MessageSerializer(serializers.ModelSerializer):
    sender_info = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_info', 'content', 'is_read', 'created_at']
        read_only_fields = ['conversation', 'sender', 'created_at']

    def get_sender_info(self, obj):
        return {
            'id': obj.sender.id,
            'username': obj.sender.username,
            'role': obj.sender.role,
        }


class ConversationSerializer(serializers.ModelSerializer):
    doctor_info = serializers.SerializerMethodField()
    patient_info = UserBasicSerializer(source='patient', read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'doctor', 'doctor_info', 'patient', 'patient_info',
            'is_active', 'created_at', 'last_message',
        ]

    def get_doctor_info(self, obj):
        return {
            'id': obj.doctor.id,
            'name': obj.doctor.user.get_full_name(),
            'specialization': obj.doctor.specialization,
        }

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {
                'content': last.content,
                'sender_username': last.sender.username,
                'created_at': last.created_at.isoformat(),
            }
        return None


# ---------------------------------------------------------------------------
# Prescription
# ---------------------------------------------------------------------------

class PrescriptionSerializer(serializers.ModelSerializer):
    doctor_info = serializers.SerializerMethodField()
    patient_info = UserBasicSerializer(source='patient', read_only=True)
    barcode_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Prescription
        fields = [
            'id', 'doctor', 'doctor_info', 'patient', 'patient_info',
            'appointment', 'medicines', 'diagnosis', 'notes',
            'barcode_data', 'barcode_image', 'barcode_image_url',
            'is_validated', 'validated_by', 'validated_at', 'created_at',
        ]
        read_only_fields = [
            'doctor', 'barcode_data', 'barcode_image', 'is_validated',
            'validated_by', 'validated_at', 'created_at',
        ]

    def get_doctor_info(self, obj):
        return {
            'id': obj.doctor.id,
            'name': obj.doctor.user.get_full_name(),
            'specialization': obj.doctor.specialization,
        }

    def get_barcode_image_url(self, obj):
        request = self.context.get('request')
        if obj.barcode_image:
            if request:
                return request.build_absolute_uri(obj.barcode_image.url)
            return f"http://localhost:8000{obj.barcode_image.url}"
        return None


# ---------------------------------------------------------------------------
# Notification
# ---------------------------------------------------------------------------

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'body', 'notif_type', 'is_read', 'created_at']
        read_only_fields = ['user', 'created_at']