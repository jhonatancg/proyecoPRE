// -------------------------------------------------------------
// LIMPIEZA PARA ANGULAR:
// Comentamos los imports porque Angular ya carga los scripts desde angular.json
// -------------------------------------------------------------

// import '../scss/main.scss';

// Import Bootstrap and dependencies
// import * as bootstrap from 'bootstrap';
// import $ from 'jquery';

// Import layout functionality
// import layout from './layout';
// import './dashboard.js';
// import './charts.js';

// Make jQuery globally available for legacy plugins
// if (typeof $ !== 'undefined') {
//     window.$ = window.jQuery = $;
// }
// window.layout = layout;

// Import modern libraries
// import AOS from 'aos';
// import { CountUp } from 'countup.js';
// import Chart from 'chart.js/auto';
// import dayjs from 'dayjs';
// import Swiper from 'swiper';
// import SimpleBar from 'simplebar';
// import TomSelect from 'tom-select';

// Import MetisMenu for sidebar
// import MetisMenu from 'metismenu';

// Make libraries globally available
// window.bootstrap = bootstrap;
// window.Chart = Chart;
// window.dayjs = dayjs;
// window.Swiper = Swiper;
// window.SimpleBar = SimpleBar;
// window.TomSelect = TomSelect;
// window.CountUp = CountUp;

// Initialize AOS (Animate On Scroll)
// Verificamos si AOS existe antes de iniciarlo
if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 800,
    once: true,
  });
}

// Initialize Bootstrap tooltips and popovers
document.addEventListener('DOMContentLoaded', function () {
  // Initialize tooltips (Solo si Bootstrap está cargado)
  if (typeof bootstrap !== 'undefined') {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }

  // Initialize MetisMenu for sidebar
  // (Solo si MetisMenu está cargado)
  if (typeof MetisMenu !== 'undefined') {
    const sideMenu = document.querySelector('#side-menu');
    if (sideMenu) {
      new MetisMenu('#side-menu');
    }
  }

  // Initialize SimpleBar for custom scrollbars
  if (typeof SimpleBar !== 'undefined') {
    const scrollElements = document.querySelectorAll('[data-simplebar]');
    scrollElements.forEach((el) => {
      new SimpleBar(el);
    });
  }

  // Initialize Tom Select for enhanced dropdowns
  if (typeof TomSelect !== 'undefined') {
    const selectElements = document.querySelectorAll('.tom-select');
    selectElements.forEach((el) => {
      new TomSelect(el, {
        plugins: ['remove_button'],
        persist: false,
        createOnBlur: true,
        create: false,
      });
    });
  }

  // -------------------------------------------------------
  // LÓGICA DEL SIDEBAR (Esto es lo más importante para tu menú)
  // -------------------------------------------------------
  const sidebarToggle = document.querySelector('#sidebarToggle');
  const sidebarClose = document.querySelector('.sidebar-close'); // Agregado para soportar tu botón de cerrar
  const sidebar = document.querySelector('.sidebar');

  // Botón para abrir/toggle
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('show');
    });
  }

  // Botón para cerrar (el que vimos en tu HTML)
  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', function () {
      sidebar.classList.remove('show');
    });
  }

  // Initialize CountUp for number animations
  if (typeof CountUp !== 'undefined') {
    const countupElements = document.querySelectorAll('.countup');
    countupElements.forEach((el) => {
      const endVal = parseFloat(el.getAttribute('data-count'));
      const countUp = new CountUp(el, endVal);
      if (!countUp.error) {
        countUp.start();
      }
    });
  }
});

// Export functions for use in other scripts
// export { Chart, dayjs, Swiper, SimpleBar, TomSelect, CountUp };