document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth Scrolling for Navigation Links - Adjusted for stickynav height
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); 
            const targetId = this.getAttribute('href'); 
            const targetElement = document.querySelector(targetId); 
            
            if (targetElement) {
                const navHeight = document.querySelector('.button-nav').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight - 10;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Scroll to Top Button Logic
    const topButton = document.getElementById("scrollTopBtn");

    window.addEventListener("scroll", function() {
        if (window.scrollY > 400) {
            topButton.style.display = "flex"; 
            setTimeout(() => { topButton.classList.add("show"); }, 10); 
        } else {
            topButton.classList.remove("show");
            setTimeout(() => {
                if(!topButton.classList.contains("show")) { topButton.style.display = "none"; }
            }, 300); 
        }
    });

    topButton.addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
