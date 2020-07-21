from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    username=models.CharField(max_length=20,unique=True)
    email=models.EmailField(unique=True)
    USERNAME_FIELD='email'
    REQUIRED_FIELDS=['username']
    def __str__(self):
        return f"{self.username}"

class Post(models.Model):
    user=models.ForeignKey(User,verbose_name="Created By",on_delete=models.CASCADE,related_name="posts")
    date=models.DateField(auto_now_add=True)
    time=models.TimeField(auto_now_add=True)
    content=models.TextField(max_length=1000)

    class Meta:
        ordering=["-date","-time"]
    
    def __str__(self):
        return f"#{self.id} {self.user}'s Post on {self.time} {self.date}"

class Follow(models.Model):
    follower_id = models.ForeignKey(User,on_delete=models.CASCADE,related_name="following")
    followed_id = models.ForeignKey(User,on_delete=models.CASCADE,related_name="followers")

    class Meta:
        unique_together=('follower_id','followed_id')
    
    def __str__(self):
        return f"{self.follower_id} follows {self.followed_id}"

class Like(models.Model):
    user=models.ForeignKey(User,verbose_name="Liked By",on_delete=models.CASCADE,related_name="likes")
    post=models.ForeignKey(Post,on_delete=models.CASCADE,related_name="likes")

    class Meta:
        unique_together=('user','post')