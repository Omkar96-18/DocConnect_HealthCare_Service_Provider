import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.utils import timezone
from api.models import (
    CustomUser, MedicalCenter, DoctorProfile, AssistantProfile, PatientProfile,
    DoctorPatientAccess, Appointment, Prescription
)
from api.views import generate_qr_image

def seed():
    print("Seeding database with demo data...")

    # 1. Admin
    admin_user, _ = CustomUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@docconnect.com',
            'first_name': 'System',
            'last_name': 'Admin',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    admin_user.set_password('admin123')
    admin_user.save()
    print("Created Admin user: admin / admin123")

    # 2. Medical Centers
    center1, _ = MedicalCenter.objects.get_or_create(
        name='City Health Hospital',
        defaults={
            'address': '123 Main Street, Sector 18, City Center',
            'latitude': 28.6139,
            'longitude': 77.2090,
            'phone': '+91 9876543210',
            'email': 'contact@cityhealth.com',
        }
    )

    center2, _ = MedicalCenter.objects.get_or_create(
        name='Metro Care Specialty Clinic',
        defaults={
            'address': '45 Healthcare Boulevard, Sector 62',
            'latitude': 28.5355,
            'longitude': 77.3910,
            'phone': '+91 9876543211',
            'email': 'info@metrocare.com',
        }
    )
    print("Created Medical Centers.")

    # 3. Doctor 1 (with Assistant)
    doc1_user, _ = CustomUser.objects.get_or_create(
        username='dr_sharma',
        defaults={
            'email': 'sharma@cityhealth.com',
            'first_name': 'Rajesh',
            'last_name': 'Sharma',
            'role': 'doctor',
            'phone': '+91 9811122233',
            'address': 'Sector 15, City Center',
            'latitude': 28.6100,
            'longitude': 77.2100,
        }
    )
    doc1_user.set_password('doctor123')
    doc1_user.save()

    doc1_profile, _ = DoctorProfile.objects.get_or_create(
        user=doc1_user,
        defaults={
            'medical_center': center1,
            'specialization': 'cardiology',
            'experience_years': 12,
            'consultation_fee': 800.00,
            'bio': 'Senior Interventional Cardiologist specializing in heart health and angiography.',
            'available_days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'is_accepting_patients': True,
            'license_number': 'MED-CRD-8821',
        }
    )

    # Assistant for Doctor 1
    asst_user, _ = CustomUser.objects.get_or_create(
        username='assistant_priya',
        defaults={
            'email': 'priya.assistant@cityhealth.com',
            'first_name': 'Priya',
            'last_name': 'Verma',
            'role': 'assistant',
            'phone': '+91 9822233344',
            'address': 'Sector 18, City Center',
        }
    )
    asst_user.set_password('assistant123')
    asst_user.save()

    asst_profile, _ = AssistantProfile.objects.get_or_create(
        user=asst_user,
        defaults={
            'medical_center': center1,
        }
    )
    # Ensure link on doctor
    doc1_profile.assistant = asst_profile
    doc1_profile.assistant_can_approve = True
    doc1_profile.save()
    print("Created Doctor 1 (Dr. Rajesh Sharma) with Assistant Priya: dr_sharma / doctor123 & assistant_priya / assistant123")

    # 4. Doctor 2 (WITHOUT Assistant - handles directly!)
    doc2_user, _ = CustomUser.objects.get_or_create(
        username='dr_patel',
        defaults={
            'email': 'patel@metrocare.com',
            'first_name': 'Ananya',
            'last_name': 'Patel',
            'role': 'doctor',
            'phone': '+91 9833344455',
            'address': 'Sector 62, Metro Hub',
            'latitude': 28.5380,
            'longitude': 77.3930,
        }
    )
    doc2_user.set_password('doctor123')
    doc2_user.save()

    doc2_profile, _ = DoctorProfile.objects.get_or_create(
        user=doc2_user,
        defaults={
            'medical_center': center2,
            'specialization': 'general',
            'experience_years': 8,
            'consultation_fee': 400.00,
            'bio': 'General Physician specializing in preventive care, seasonal ailments and family medicine.',
            'available_days': ['Monday', 'Wednesday', 'Friday', 'Saturday'],
            'is_accepting_patients': True,
            'license_number': 'MED-GEN-4491',
        }
    )
    print("Created Doctor 2 (Dr. Ananya Patel without assistant): dr_patel / doctor123")

    # 5. Patient 1
    patient_user, _ = CustomUser.objects.get_or_create(
        username='patient_rahul',
        defaults={
            'email': 'rahul.kumar@gmail.com',
            'first_name': 'Rahul',
            'last_name': 'Kumar',
            'role': 'patient',
            'phone': '+91 9955566677',
            'address': 'Sector 22, Green Park',
            'latitude': 28.6180,
            'longitude': 77.2150,
        }
    )
    patient_user.set_password('patient123')
    patient_user.save()

    patient_profile, _ = PatientProfile.objects.get_or_create(
        user=patient_user,
        defaults={
            'blood_group': 'O+',
            'allergies': 'Penicillin',
            'medical_history': 'Mild hypertension',
            'emergency_contact_name': 'Sunita Kumar',
            'emergency_contact_phone': '+91 9955566688',
        }
    )
    print("Created Patient: patient_rahul / patient123")

    # 6. Access: Patient with Doctor 1 (Dr Sharma, pending assistant or approved)
    access, _ = DoctorPatientAccess.objects.get_or_create(
        doctor=doc1_profile,
        patient=patient_user,
        defaults={
            'status': 'pending',
            'can_message': False,
            'assistant_permission_granted': True,
        }
    )
    access.assistant_permission_granted = True
    access.save()

    # Access: Patient with Doctor 2 (Direct, approved)
    access2, _ = DoctorPatientAccess.objects.get_or_create(
        doctor=doc2_profile,
        patient=patient_user,
        defaults={
            'status': 'approved',
            'can_message': True,
            'approved_by': doc2_user,
        }
    )

    # 7. Sample Appointment with Doctor 1
    appt, _ = Appointment.objects.get_or_create(
        doctor=doc1_profile,
        patient=patient_user,
        defaults={
            'assistant': asst_profile,
            'mode': 'in_person',
            'status': 'pending_assistant',
            'scheduled_at': timezone.now() + timezone.timedelta(days=2),
            'patient_notes': 'Routine chest discomfort checkup.',
        }
    )

    # 8. Sample Prescription by Doctor 2 for Patient Rahul
    rx_medicines = [
        {'name': 'Paracetamol 500mg', 'dosage': '1 tablet', 'frequency': 'Twice a day', 'duration': '5 days', 'instructions': 'After meals'},
        {'name': 'Vitamin C 500mg', 'dosage': '1 tablet', 'frequency': 'Once a day', 'duration': '10 days', 'instructions': 'Morning with water'}
    ]
    rx, created = Prescription.objects.get_or_create(
        doctor=doc2_profile,
        patient=patient_user,
        defaults={
            'diagnosis': 'Seasonal Viral Flu & Mild Fatigue',
            'notes': 'Rest adequately and stay hydrated.',
            'medicines': rx_medicines,
            'is_validated': False,
        }
    )
    if not rx.barcode_data:
        rx.barcode_data = str(rx.id)
        img_content = generate_qr_image(rx.barcode_data)
        rx.barcode_image.save(f'qr_{rx.barcode_data}.png', img_content, save=True)

    # 9. Prescription by Doctor 1 (Dr. Sharma)
    rx2, _ = Prescription.objects.get_or_create(
        doctor=doc1_profile,
        patient=patient_user,
        defaults={
            'diagnosis': 'Cardiovascular Assessment & Mild Hypertension',
            'notes': 'Monitor blood pressure daily in the morning.',
            'medicines': [
                {'name': 'Amlodipine 5mg', 'dosage': '1 tablet', 'frequency': 'Once daily', 'duration': '30 days', 'instructions': 'Morning with breakfast'},
                {'name': 'Atorvastatin 10mg', 'dosage': '1 tablet', 'frequency': 'Once daily', 'duration': '30 days', 'instructions': 'At bedtime'}
            ],
            'is_validated': False,
        }
    )
    if not rx2.barcode_data:
        rx2.barcode_data = str(rx2.id)
        img_content2 = generate_qr_image(rx2.barcode_data)
        rx2.barcode_image.save(f'qr_{rx2.barcode_data}.png', img_content2, save=True)

    print("Demo data seeded successfully!")

if __name__ == '__main__':
    seed()
