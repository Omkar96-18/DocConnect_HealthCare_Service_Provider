from django.contrib import admin
from .models import (
    CustomUser, MedicalCenter, DoctorProfile, AssistantProfile, PatientProfile,
    DoctorPatientAccess, Appointment, Conversation, Message,
    Prescription, Notification,
)


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    ordering = ('-date_joined',)


@admin.register(MedicalCenter)
class MedicalCenterAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'phone', 'email', 'created_at')
    search_fields = ('name', 'address', 'email')
    ordering = ('name',)


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'specialization', 'experience_years', 'consultation_fee', 'is_accepting_patients')
    list_filter = ('specialization', 'is_accepting_patients')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'license_number')
    ordering = ('user__last_name',)


@admin.register(AssistantProfile)
class AssistantProfileAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'doctor', 'medical_center')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'date_of_birth', 'blood_group', 'emergency_contact_name')
    list_filter = ('blood_group',)
    search_fields = ('user__username', 'user__first_name', 'user__last_name')


@admin.register(DoctorPatientAccess)
class DoctorPatientAccessAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'status', 'can_message', 'created_at')
    list_filter = ('status', 'can_message')
    search_fields = ('patient__username', 'doctor__user__username')
    ordering = ('-created_at',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'mode', 'status', 'scheduled_at', 'created_at')
    list_filter = ('status', 'mode')
    search_fields = ('patient__username', 'doctor__user__username')
    ordering = ('-scheduled_at',)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('patient', 'doctor', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('patient__username', 'doctor__user__username')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'conversation', 'is_read', 'created_at')
    list_filter = ('is_read',)
    search_fields = ('sender__username', 'content')
    ordering = ('-created_at',)


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'is_validated', 'validated_at', 'created_at')
    list_filter = ('is_validated',)
    search_fields = ('patient__username', 'doctor__user__username', 'diagnosis')
    ordering = ('-created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notif_type', 'is_read', 'created_at')
    list_filter = ('notif_type', 'is_read')
    search_fields = ('user__username', 'title', 'body')
    ordering = ('-created_at',)
