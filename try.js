// Link button
document.getElementById("signinbtn").addEventListener("click", function(){
    window.open = "https://www.skr.ac.th/"
})
// dropdown
const buttons = document.querySelectorAll(".drop-btn")
buttons.forEach(button => {
    button.addEventListener("click",function(event){
        const menu = this.nextElementSibling;
        menu.classList.toggle("show")
        event.stopPropagation();
    })
})
document.addEventListener("click",function(){
  document.querySelectorAll(".dropdown-content").forEach(menu => {
    menu.classList.remove("show")
  })
})
// slider
let currenIndex = 0;
const slider = document.querySelector(".slider")

function updateslide(){
    slider.style.transform = `translateX(${-currenIndex * 1200}px)`
}

function Prevpage(){
    if(currenIndex > 0){
        currenIndex--;
    }
    else{
        currenIndex = 3;
    }
    updateslide();
}

function Nextpage(){
    if(currenIndex < 3){
        currenIndex++;
    }
    else{
        currenIndex = 0;
    }
    updateslide();
}

setInterval(Nextpage, 3000)
// input
const searchInput = document.getElementById("input")
const items = document.querySelectorAll(".item")

searchInput.addEventListener("input",function(){
    const Keyword = searchInput.value.toLowerCase();
    items.forEach(item => {
        const text = item.innerText.toLowerCase()
        if(text.includes(Keyword)){
            item.classList.remove("hidden")
        }
        else{
            item.classList.add("hidden")
        }
    })
})



