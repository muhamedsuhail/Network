var user = document.querySelector('#user').innerHTML;
var csrftoken = Cookies.get('csrftoken');
var click_event = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) ? 'touchstart' : 'click';
var heart = document.querySelectorAll('.heart');
var path=window.location.pathname;
document.addEventListener('DOMContentLoaded', () => {
    d = new FormData();
    d.append('tag', "ReadLikesDb");
    fetch(path, {
        method: "POST",
        credentials: 'same-origin',
        body: d,
        headers: { "X-CSRFToken": csrftoken },
    })
    .then(response => {
        return response.json();

    })
    .then(data=>{
        for (j in data) {
            if(document.querySelector(`#p${j}`))
            {
                document.querySelector(`#p${j}`).querySelector('.numlikes').innerHTML=data[j].length+' Likes';
                if (data[j].includes(user)) {
                    document.querySelector(`#p${j}`).querySelector('.heart').classList.toggle('bg');
                }
            }
        }
    }); 

    heart.forEach(i => {
        i.addEventListener(click_event, (e) => {
            if (i.classList.contains("bg")) {
                i.classList.toggle('bg');
            }
            else {
                i.classList.toggle('is-animating');
            }
            updateLike(this.event.target);
        });
        i.addEventListener('animationend', (event) => {
                i.classList.toggle('is-animating');
                i.classList.toggle('bg');
        });
    })
    function updateLike(target){
        target=target.parentNode.parentNode.parentNode.id;
        var data = new FormData();
        data.append('i', `${target.slice(1)}`);
        data.append('tag', 'UpdateLikesDb')
        fetch('/', {
            method: "POST",
            credentials: 'same-origin',
            body: data,
            headers: { "X-CSRFToken": csrftoken },
        })
        .then(response => {
            return response.json();
        }).then(data => {
            // console.log(data)
            document.querySelector(`#${target}`).querySelector('.numlikes').innerHTML=data.likes.length+' Likes';
        })
    }
    document.querySelectorAll('.x').forEach(i=>{
        addEventListener('click',()=>{
            document.querySelector('textarea').value="";
        });
    })
    document.querySelectorAll('.p_user').forEach(i=>{
        if(i.innerHTML!=user)
        {
            i.parentNode.parentNode.querySelector('.post').remove();
        }
    })
    document.querySelectorAll('.edit').forEach(element=>{
        element.addEventListener('click',()=>{
            var id=element.parentNode.parentNode.parentNode.id;
            data=new FormData();
            data.append('id',parseInt(id.slice(1)))
            fetch('/Posts/GetPost',{
                method: "POST",
                credentials: 'same-origin',
                body: data,
                headers: { "X-CSRFToken": csrftoken },
            })
            .then(response=>{
                return response.json();
            })
            .then(data=>{
                document.querySelector('#EditPostModal').querySelector('textarea').value=data["content"];
            })

            document.querySelector('#editpost').addEventListener(click_event,()=>{
                var econtents=document.querySelector('#EditPostModal').querySelector('textarea').value;
                data=new FormData();
                data.append('contents',econtents);
                data.append('id',parseInt(id.slice(1)))
                console.log(id.slice(1))
                fetch('/Posts/EditPost',{
                    method: "POST",
                    credentials: 'same-origin',
                    body: data,
                    headers: { "X-CSRFToken": csrftoken },
                })
                .then(response=>response.json())
                .then((data)=> {
                    document.querySelector(`#${id}`).querySelector('.card-text').querySelector('p').innerHTML=data["contents"];
                    document.querySelector('#EditPostModal').querySelector('.close').click();
                })
                return
            });

        })
    })

    document.querySelectorAll('.delete').forEach(i=>{
        i.addEventListener('click',()=>{
            i=i.parentNode.parentNode.parentNode;
            let response=confirm("Are you sure? Do you want to delete the post?");
            if(response)
            {
                i.style.animationPlayState="running";
                i.addEventListener('animationend',()=>{
                    i.remove();
                    var csrftoken = Cookies.get('csrftoken');
                    data=new FormData();
                    data.append('id',i.id.slice(1))
                    fetch('/Posts/DeletePost',{
                        method: "POST",
                        credentials: 'same-origin',
                        body: data,
                        headers: { "X-CSRFToken": csrftoken },
                    })
                    .then(()=> {
                        if(window.location.pathname=="/AllPosts")
                        {
                            window.location.reload();
                        }
                        else
                        {
                            window.location.pathname="/AllPosts";
                        }
                    })

                })
            }
        })
    })

    
    
});

function fetchFollowers(tag,button)
{
    fetch(path,{
        method: "POST",
        credentials: 'same-origin',
        body: tag,
        headers: { "X-CSRFToken": csrftoken },
    })
    .then(response=>{
        return response.json()
    })
    .then(data=>{
        if(data["followers"].includes(user))
        {
            button.innerHTML="Unfollow";
        }
        else{
            button.innerHTML="Follow";
        }                
        document.querySelector('.details').appendChild(button);
    })
    .then(()=>{
        document.querySelector('#follow').addEventListener(click_event,()=>{
        var username=p_user;
        follow_data=new FormData();
        follow_data.append('tag','Follow')
        followHandler(follow_data,button)
    })
    });
};
function followHandler(follow_data,button)
{
    fetch(path,{
            method: "POST",
            credentials: 'same-origin',
            body: follow_data,
            headers: { "X-CSRFToken": csrftoken },
        })
        .then(()=>{
            button.innerHTML=(button.innerHTML=="Follow")? "Unfollow":"Follow";
        })
};
