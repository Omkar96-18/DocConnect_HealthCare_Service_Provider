from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('assistant', 'Assistant')
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profiles/', null=True, blank=True)


class MedicalCenter(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class DoctorProfile(models.Model):
    SPECIALIZATION_CHOICES = [
        ('general', 'General Physician'),
        ('cardiology', 'Cardiology'),
        ('neurology', 'Neurology'),
        ('orthopedics', 'Orthopedics'),
        ('pediatrics', 'Pediatrics'),
        ('gynecology', 'Gynecology'),
        ('dermatology', 'Dermatology'),
        ('psychiatry', 'Psychiatry'),
        ('ophthalmology', 'Ophthalmology'),
        ('ent', 'ENT'),
        ('dentistry', 'Dentistry'),
        ('urology', 'Urology'),
        ('oncology', 'Oncology'),
        ('endocrinology', 'Endocrinology'),
        ('nephrology', 'Nephrology'),
    ]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    medical_center = models.ForeignKey(
        MedicalCenter, on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors'
    )
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES, default='general')
    experience_years = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bio = models.TextField(blank=True)
    available_days = models.JSONField(default=list)  # ['Monday','Tuesday',...]
    available_from = models.TimeField(null=True, blank=True)
    available_to = models.TimeField(null=True, blank=True)
    is_accepting_patients = models.BooleanField(default=True)
    license_number = models.CharField(max_length=100, blank=True)
    assistant = models.ForeignKey(
        'AssistantProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='doctors'
    )
    assistant_can_approve = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.user.get_full_name()} ({self.specialization})"


class AssistantProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='assistant_profile')
    medical_center = models.ForeignKey(MedicalCenter, on_delete=models.SET_NULL, null=True, blank=True)

    @property
    def doctor(self):
        """Primary doctor assigned to this assistant, for backward compatibility."""
        return self.doctors.first()

    def __str__(self):
        return f"Assistant: {self.user.get_full_name()}"


class PatientProfile(models.Model):
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'), ('O+', 'O+'), ('O-', 'O-'),
    ]
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True)
    allergies = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.user.get_full_name()


class DoctorPatientAccess(models.Model):
    """Tracks patient access to a doctor. Assistant must approve if doctor has one."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='patient_accesses')
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='doctor_accesses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_accesses'
    )
    can_message = models.BooleanField(default=False)
    assistant_permission_granted = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('doctor', 'patient')

    def __str__(self):
        return f"{self.patient.get_full_name()} -> Dr. {self.doctor.user.get_full_name()}"


class Appointment(models.Model):
    MODE_CHOICES = [
        ('in_person', 'In Person'),
        ('video', 'Video Call'),
        ('phone', 'Phone Call'),
    ]
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('pending_assistant', 'Pending Assistant Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='appointments')
    assistant = models.ForeignKey(
        AssistantProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments'
    )
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='in_person')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='requested')
    scheduled_at = models.DateTimeField()
    notes = models.TextField(blank=True)
    patient_notes = models.TextField(blank=True)
    approved_by_assistant = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.patient.get_full_name()} with Dr.{self.doctor.user.last_name} on {self.scheduled_at}"


class Conversation(models.Model):
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='conversations')
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='conversations')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('doctor', 'patient')


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:40]}"


class Prescription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='prescriptions')
    patient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='prescriptions')
    appointment = models.ForeignKey(
        Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescriptions'
    )
    medicines = models.JSONField(default=list)  # [{name, dosage, frequency, duration, instructions}]
    diagnosis = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    barcode_data = models.CharField(max_length=500, blank=True)
    barcode_image = models.ImageField(upload_to='barcodes/', null=True, blank=True)
    is_validated = models.BooleanField(default=False)
    validated_by = models.ForeignKey(
        CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='validated_prescriptions'
    )
    validated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rx for {self.patient.get_full_name()} by Dr.{self.doctor.user.last_name}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('appointment', 'Appointment'),
        ('message', 'Message'),
        ('prescription', 'Prescription'),
        ('access', 'Access'),
        ('general', 'General'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    body = models.TextField()
    notif_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.notif_type}] {self.title} -> {self.user.username}"