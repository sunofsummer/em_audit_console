from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required()
def index(request):
    return render(request, 'sitemesh.html')

@login_required()
def my_view(request):
    return render(request, 'sitemesh.html')
    # username = ''  # request.POST['username']
    # password = ''  # request.POST['password']
    # user = authenticate(username=username, password=password)
    # if user is not None:
    #     if user.is_active:
    #         login(request, user)
    #         # Redirect to a success page.
    #     else:
    #         return HttpResponse("Return a 'disabled account' error message")
    # else:
    #     return HttpResponse("Return an 'invalid login' error message")