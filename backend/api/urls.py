from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register(r'medical-centers', views.MedicalCenterViewSet, basename='medical-center')
router.register(r'admin/medical-centers', views.MedicalCenterViewSet, basename='admin-medical-center')
router.register(r'admin/users', views.AdminUserViewSet, basename='admin-user')
router.register(r'appointments', views.AppointmentViewSet, basename='appointment')
router.register(r'prescriptions', views.PrescriptionViewSet, basename='prescription')

urlpatterns = [
    # Auth
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Profile
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/doctor/', views.DoctorProfileUpdateView.as_view(), name='doctor-profile'),
    path('profile/patient/', views.PatientProfileUpdateView.as_view(), name='patient-profile'),
    path('profile/assistant/', views.AssistantProfileUpdateView.as_view(), name='assistant-profile'),

    # Doctors
    path('doctors/', views.DoctorListView.as_view(), name='doctor-list'),
    path('doctors/<int:pk>/', views.DoctorDetailView.as_view(), name='doctor-detail'),

    # Assistant – Doctor assignment
    path('assistants/', views.AssistantListView.as_view(), name='assistant-list'),
    path('assistant/assign-doctor/', views.AssistantAssignDoctorView.as_view(), name='assign-doctor'),

    # Doctor–Patient Access
    path('access/request/', views.RequestAccessView.as_view(), name='request-access'),
    path('access/grant-assistant-permission/', views.GrantAssistantPermissionView.as_view(), name='grant-assistant-permission'),
    path('access/approve/<int:access_id>/', views.AssistantApproveAccessView.as_view(), name='approve-access'),
    path('access/list/', views.PatientAccessListView.as_view(), name='access-list'),

    # Conversations
    path('conversations/', views.ConversationListCreateView.as_view(), name='conversation-list'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),

    # Admin Stats
    path('admin/stats/', views.AdminStatsView.as_view(), name='admin-stats'),

    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/read/', views.MarkNotificationReadView.as_view(), name='mark-notification-read'),

    # Router (ViewSets)
    path('', include(router.urls)),
]