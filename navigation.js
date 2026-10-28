// One shared public navigation for every page.
const currentPage=location.pathname.split('/').pop()||'index.html';
const header=document.querySelector('body > header');
if(header){
 header.innerHTML='<a class="logo" href="/" aria-label="Hauszy home">hauszy<span>↗</span></a><nav aria-label="Main navigation"><a href="projects.html?v=nav-final" data-nav="projects">Explore projects</a><details class="tools-menu"><summary>Tools <span aria-hidden="true">⌄</span></summary><div class="tools-dropdown"><a href="loan-calculator.html?v=nav-final">Loan Calculator</a></div></details><a href="about.html?v=nav-final" data-nav="about">About Me</a></nav>';
 const active=currentPage==='projects.html'||currentPage==='property.html'?header.querySelector('[data-nav="projects"]'):currentPage==='about.html'?header.querySelector('[data-nav="about"]'):currentPage==='loan-calculator.html'?header.querySelector('.tools-menu summary'):null;
 if(active){active.classList.add('active');if(active.tagName==='A')active.setAttribute('aria-current','page')}
 if(currentPage==='loan-calculator.html')header.querySelector('.tools-dropdown a').setAttribute('aria-current','page');
 const toolsMenu=header.querySelector('.tools-menu');
 document.addEventListener('click',event=>{if(!toolsMenu.contains(event.target))toolsMenu.open=false});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toolsMenu.open){toolsMenu.open=false;toolsMenu.querySelector('summary').focus()}});
}
