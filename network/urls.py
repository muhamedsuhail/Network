
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("Posts", views.manage_Posts, name="add"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("Profile/<int:u>",views.profile_page,name="profile"),
    path("Posts/<str:p_tag>", views.manage_Posts, name="add"),
    path("<str:tag>", views.index, name="index"),
]
