const menus = document.getElementById("menus");
menus.insertAdjacentHTML("beforebegin", `<div id="tp-weather-widget"></div>`);
(function(a,h,g,f,e,d,c,b){b=function(){d=h.createElement(g);c=h.getElementsByTagName(g)[0];d.src=e;d.charset="utf-8";d.async=1;c.parentNode.insertBefore(d,c)};a["SeniverseWeatherWidgetObject"]=f;a[f]||(a[f]=function(){(a[f].q=a[f].q||[]).push(arguments)});a[f].l=+new Date();if(a.attachEvent){a.attachEvent("onload",b)}else{a.addEventListener("load",b,false)}}(window,document,"script","SeniverseWeatherWidget","//cdn.sencdn.com/widget2/static/js/bundle.js?t="+parseInt((new Date().getTime() / 100000000).toString(),10)));
window.SeniverseWeatherWidget('show', {
  flavor: "slim",
  location: "WX4FBXXFKE4F",
  geolocation: true,
  language: "auto",
  unit: "c",
  theme: "auto",
  token: "c90b5963-75fc-49bc-8b7c-0e44c316b8ff",
  hover: "enabled",
  container: "tp-weather-widget"
})