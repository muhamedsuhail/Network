var user = document.querySelector('#user').innerHTML;
var csrftoken = Cookies.get('csrftoken'); //Django csrf validation
var click_event = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) ? 'touchstart' : 'click'; 
var path=window.location.pathname;

document.addEventListener('DOMContentLoaded', () => {
    
    tag = new FormData();
    tag.append('tag', "ReadLikesDb");
    
    readLikes(tag);

    var heart = document.querySelectorAll('.heart');

    heart.forEach(i => {
        
        // Animate Like Option.

        LikeBurst(i);
    
    });

    document.querySelectorAll('.x').forEach(i=>{
        
        // Clear Textarea (After closing Modal).
        
        clearTextArea(i);
    
    });

    document.querySelectorAll('.p_user').forEach(i=>{
        
        // Users can only edit or delete their own posts.
        
        removePostEditOptions(i);

    });

    document.querySelectorAll('.edit').forEach(element=>{
        
        // Edit Post on clicking edit icon.

        element.addEventListener('click',()=>{
            
            var id=element.parentNode.parentNode.parentNode.id;
            
            const post_id=new FormData();
            post_id.append('id',parseInt(id.slice(1)))
            
            getPostContents(post_id);

            editPostModalHandler(id);
            
        });
    });

    document.querySelectorAll('.delete').forEach(i=>{
        
        // Delete Post on clicking Thrashcan icon.

        i.addEventListener('click',()=>{
            
            i=i.parentNode.parentNode.parentNode;

            let response=confirm("Are you sure? Do you want to delete the post?");
            if(response)
            {
                deletePost(i);
            }

        });
    });

});



function LikeBurst(i)
{
    
    i.addEventListener(click_event, (e) => {
            
        if (i.classList.contains("bg")) 
        {
            i.classList.toggle('bg');
        }
        else 
        {
            i.classList.toggle('is-animating');
        }
        
        updateLike(this.event.target);
    
    });

    i.addEventListener('animationend', (event) => {
        
        i.classList.toggle('is-animating');
        i.classList.toggle('bg');
    
    });

}



function readLikes(tag)
{

    fetch(path, {
        method: "POST",
        credentials: 'same-origin',
        body: tag,
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

                if (data[j].includes(user)) 
                {
                    // Mark as liked if user aldready liked it.
                    document.querySelector(`#p${j}`).querySelector('.heart').classList.toggle('bg');
                }
            }
        }
    
    }); 

}



function updateLike(target)
{

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
    })
    
    .then(data => {
        
        // Update Like Counter.
        
        document.querySelector(`#${target}`).querySelector('.numlikes').innerHTML=data.likes.length+' Likes';
    })

}



function newPost(data)
{
    fetch('/Posts',{
        method: "POST",
        credentials: 'same-origin',
        body: data,
        headers: { "X-CSRFToken": csrftoken },
    })

    .then(()=> {
        if(window.location.pathname!=="/AllPosts")
        {
            window.location.pathname="/AllPosts";
        }
        else
        {
            window.location.reload();
        }
    })

}



function getPostContents(post_id)
{
    
    fetch('/Posts/GetPost',{
        method: "POST",
        credentials: 'same-origin',
        body: post_id,
        headers: { "X-CSRFToken": csrftoken },
    })

    .then(response=>{
        return response.json();
    })

    .then(data=>{

        // Populate Textarea with Post contents.
        
        document.querySelector('#EditPostModal').querySelector('textarea').value=data["content"];
    })

}



function editPostModalHandler(id)
{

    document.querySelector('#editpost').addEventListener(click_event,()=>{
                
        var econtents=document.querySelector('#EditPostModal').querySelector('textarea').value;
        
        data=new FormData();
        data.append('contents',econtents);
        data.append('id',parseInt(id.slice(1)))
        
        editPost(data,id);

    });

}



function editPost(data,id)
{
    
    fetch('/Posts/EditPost',{
        method: "POST",
        credentials: 'same-origin',
        body: data,
        headers: { "X-CSRFToken": csrftoken },
    })

    .then(response=>response.json())

    .then((data)=> {
        
        // Populate Contents of post with new contents and close the EditModal.

        document.querySelector(`#${id}`).querySelector('.card-text').querySelector('p').innerHTML=data["contents"];
        document.querySelector('#EditPostModal').querySelector('.close').click();
    })

}



function clearTextArea(i)
{

    addEventListener('click',()=>{
      
        document.querySelector('textarea').value="";
  
    });

}



function removePostEditOptions(i)
{

    if(i.innerHTML!=user)
        {
            i.parentNode.parentNode.querySelector('.post').remove();
        }

}



function deletePost(i)
{

    i.style.animationPlayState="running";

    i.addEventListener('animationend',()=>{

        i.remove();

        data=new FormData();
        data.append('id',i.id.slice(1))

        fetch('/Posts/DeletePost',{
            method: "POST",
            credentials: 'same-origin',
            body: data,
            headers: { "X-CSRFToken": csrftoken },
        })
    })

}



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
        
        // Handle contents of follow button.
    
        if(data["followers"].includes(user))
        {
            button.innerHTML="Unfollow";
        }
        else
        {
            button.innerHTML="Follow";
        }                
        
        document.querySelector('.details').appendChild(button);
    })

    .then(()=>{

        document.querySelector('#follow').addEventListener(click_event,()=>{

            follow_data=new FormData();
            follow_data.append('tag','Follow')
            
            followHandler(follow_data,button)
        
        })
    });


}



function followHandler(follow_data,button)
{
    
    fetch(path,{
        method: "POST",
        credentials: 'same-origin',
        body: follow_data,
        headers: { "X-CSRFToken": csrftoken },
    })

    .then(()=>{
        // Update Followers count
        
        let followers_count=document.querySelector('.followers');
        button.innerHTML=(button.innerHTML=="Follow")? "Unfollow":"Follow";
        followers_count.innerHTML=(button.innerHTML=="Unfollow") ? parseInt(followers_count.innerHTML)+1:parseInt(followers_count.innerHTML)-1;
    })

};
