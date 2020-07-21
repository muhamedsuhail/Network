from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect,JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django import forms
from .models import User,Post,Follow,Like
from itertools import chain
from django.core.paginator import Paginator


class LoginForm(forms.Form):

    email = forms.EmailField(label='', widget=forms.EmailInput(attrs={'placeholder':'Email', 'class':'form-control'}))
    password = forms.CharField(label='', widget=forms.PasswordInput(attrs={'placeholder':'Password', 'class':'form-control'}))

class RegisterForm(forms.Form):

    username = forms.CharField(label='',widget=forms.TextInput(attrs={'placeholder':'Username','class':'form-control'}))
    email = forms.EmailField(label='',widget=forms.EmailInput(attrs={'placeholder':'Email','class':'form-control'}))
    password = forms.CharField(label='',widget=forms.PasswordInput(attrs={'placeholder':'Password','class':'form-control'}))
    confirmation = forms.CharField(label='',widget=forms.PasswordInput(attrs={'placeholder':'Confirm Password','class':'form-control'}))

def register(request):
    
    if request.method == "POST":
        
        form=RegisterForm(request.POST)
        
        if form.is_valid():
        
            username = form.cleaned_data["username"]
            email = form.cleaned_data["email"]

            # Ensure password matches confirmation
            password = form.cleaned_data["password"]
            confirmation = form.cleaned_data["confirmation"]
        
            if password != confirmation:
        
                return render(request, "network/register.html", {
                    "message": "Passwords must match.",
                    'form':RegisterForm()
                })

            # Attempt to create new user
            try:
    
                user = User.objects.create_user(username, email, password)
                user.save()
    
            except IntegrityError:
    
                return render(request, "network/register.html", {
                    "message": "User already exist.",
                    'form':RegisterForm()
                })
    
            return HttpResponseRedirect(reverse("login"))
    
    else:
    
        return render(request, "network/register.html",{
            'form':RegisterForm()
        })

def login_view(request):
    
    if request.method == "POST":

        # Attempt to sign user in
        form=LoginForm(request.POST)
    
        if form.is_valid():
    
            email = form.cleaned_data["email"]
            password = form.cleaned_data["password"]
            user = authenticate(request, email=email, password=password)
    
        else:
    
            user=None

        # Check if authentication successful
        if user is not None:
    
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
    
        else:
    
            return render(request, "network/login.html", {
                "message": "Invalid email and/or password.",
                'form':LoginForm()    
            })
    
    else:
    
        return render(request, "network/login.html",{
            'form':LoginForm()
        })


def logout_view(request):
    
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def index(request,tag="AllPosts"):

    if request.user.is_authenticated:
        
        if request.method=='POST':
        
            if request.POST['tag']=="UpdateLikesDb":

                    # Request to change Like status.

                    post_id=request.POST['i']
    
                    try:
                        
                        # Update Likes in Database.
                        
                        like=Like.objects.create(user=request.user,post=Post.objects.get(id=post_id))
                        like.save()
    
                    except IntegrityError:
                        
                        # Unlike if user aldready likes it.
                        likes=Post.objects.get(id=post_id).likes.all()
    
                        for i in likes:
    
                            if i.user==request.user:
    
                                i.delete()
        
                    query_set=list(i.user.username for i in Post.objects.get(id=post_id).likes.all())
                    likes={"post_id":post_id,"likes":query_set}
    
                    return JsonResponse(likes)
        
            else:
        
                    if tag=="AllPosts":
                        
                        # Fetch likes of all posts.
                        likes={}
    
                        for i in Post.objects.all():
    
                            likes[i.id]=[]
    
                            for j in i.likes.all():
    
                                likes[i.id].append(j.user.username)
    
                        return JsonResponse(likes)
        
                    else:

                        # Fetch likes of posts(Following).
                        likes={}
                        
                        for j in Follow.objects.filter(follower_id=request.user):
    
                            for i in Post.objects.filter(user=j.followed_id):
    
                                likes[i.id]=[]
    
                                for j in i.likes.all():
    
                                    likes[i.id].append(j.user.username)
    
                        return JsonResponse(likes)
                    
        # Get request to index returns a Json Response of posts.
        posts= Post.objects.all()
        head="All Posts"
    
        if tag=='FPosts':
            
            # Get Posts only from Following Users.
            posts=[]
            
            for i in Follow.objects.filter(follower_id=request.user):
    
                posts=list(chain(posts,Post.objects.filter(user=i.followed_id)))
            
            head="Posts by people you follow" 

        # Paginator passes 10 posts per page.
        paginator = Paginator(posts, 10) 

        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        
        return render(request, "network/index.html",{
            'posts':page_obj,
            'head':head,
            'range':range(1,paginator.num_pages+1)
        })

    else:
        
        return HttpResponseRedirect(reverse("login"))

def manage_Posts(request,p_tag="NewPost"):
    
    if request.user.is_authenticated:
    
        if request.method=="POST":
    
            if p_tag=="NewPost":
                # Add new post to database. 

                contents = request.POST['contents']
                p=Post.objects.create(user=request.user,content=contents)
                p.save()    
                return JsonResponse({'msg':"New Post Added Successfully"}) 
    
            elif p_tag=="EditPost":
                # Update edited post contents to database.

                contents = request.POST['contents']
                post_id = int(request.POST['id'])
                p=Post.objects.get(id=post_id)
                p.content=contents
                p.save()
                return JsonResponse({'msg':"Post Edited Successfully",'contents':p.content}) 
    
            elif p_tag=="GetPost":
                # Get post contents by id.
                
                id=request.POST["id"]
                p=Post.objects.get(id=id)
                return JsonResponse({'content':p.content})
                
            else:
                # Delete post.

                post_id=request.POST['id']
                Post.objects.get(id=post_id).delete()
                return JsonResponse({'msg':"Post Deleted Successfully"}) 

    else:
        return HttpResponseRedirect(reverse("login"))




def profile_page(request,u):
    
    if request.user.is_authenticated:
    
        if request.method=="POST":
    
            if request.POST['tag']=="Follow":
                
                try:
                    
                    # Create Follow object in database.

                    f=Follow.objects.create(follower_id=request.user,followed_id=User.objects.get(id=u))
                    return JsonResponse({'msg':"Success"})
    
                except IntegrityError:
                    
                    # Delete Follow object if aldready exist.
                    
                    f=Follow.objects.get(follower_id=request.user,followed_id=User.objects.get(id=u))
                    f.delete()
                    return JsonResponse({'msg':"Success"})
    
            elif request.POST['tag']=="GetFollowers":
                # Fetch Followers for a specific user.

                followers=[]
    
                for i in User.objects.get(id=u).followers.all():
    
                    followers.append(i.follower_id.username)
    
                return JsonResponse({'followers':followers})

            # Mark as Liked if User aldready like a post in a profile.
            likes={}
            for i in Post.objects.filter(user=User.objects.get(id=u)):
    
                likes[i.id]=[]
    
                for j in i.likes.all():
    
                    likes[i.id].append(j.user.username)

            return JsonResponse(likes)

        return render(request,"network/profile_page.html",{
            'profile':User.objects.get(id=u),
        })

    else:

        return render(request, "network/register.html",{
            'form':RegisterForm()
        })
