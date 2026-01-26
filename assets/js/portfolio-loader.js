/**
 * Portfolio Data Loader
 * 動態載入和渲染 portfolio 專案資料
 */

class PortfolioLoader {
  constructor() {
    this.portfolioData = null;
  }

  /**
   * 從 JSON 檔案載入所有專案資料
   */
  async loadPortfolioData() {
    try {
      const response = await fetch('assets/data/portfolio.json');
      const data = await response.json();
      this.portfolioData = data.projects;
      return this.portfolioData;
    } catch (error) {
      console.error('Error loading portfolio data:', error);
      console.warn('提示：請使用本地服務器運行網站（如：python -m http.server 或 VS Code Live Server）');
      return null;
    }
  }

  /**
   * 根據 ID 獲取單個專案資料
   */
  getProjectById(id) {
    if (!this.portfolioData) {
      console.error('Portfolio data not loaded yet');
      return null;
    }
    return this.portfolioData.find(project => project.id === id);
  }

  /**
   * 從 URL 參數獲取專案 ID
   */
  getProjectIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  /**
   * 渲染專案詳情頁面
   */
  renderProjectDetails(project) {
    if (!project) {
      console.error('Project not found');
      return;
    }

    document.title = `${project.title} - Portfolio Details`;

    const breadcrumbTitle = document.querySelector('.page-title h1');
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = project.title;
    }

    this.renderImageSlider(project.images);
    this.renderProjectInfo(project);
    this.renderProjectDescription(project);
  }

  /**
   * 渲染圖片輪播
   */
  renderImageSlider(images) {
    const swiperWrapper = document.querySelector('.portfolio-details-slider .swiper-wrapper');
    if (!swiperWrapper) return;

    swiperWrapper.innerHTML = '';
    
    images.forEach(imageSrc => {
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `<img src="${imageSrc}" alt="">`;
      swiperWrapper.appendChild(slide);
    });

    setTimeout(() => {
      if (typeof initSwiper === 'function') {
        initSwiper();
      } else if (window.Swiper) {
        const swiperElement = document.querySelector('.portfolio-details-slider.init-swiper');
        if (swiperElement && !swiperElement.swiper) {
          const config = JSON.parse(swiperElement.querySelector('.swiper-config').innerHTML.trim());
          new Swiper(swiperElement, config);
        }
      }
    }, 100);
  }

  /**
   * 渲染專案資訊
   */
  renderProjectInfo(project) {
    const projectInfo = document.querySelector('.portfolio-info ul');
    if (!projectInfo) return;

    let infoHTML = `<li><strong>Category</strong>: ${project.category}</li>`;
    if (project.date) {
      infoHTML += `<li><strong>Project date</strong>: ${project.date}</li>`;
    }
    
    projectInfo.innerHTML = infoHTML;
  }

  /**
   * 渲染專案描述
   */
  renderProjectDescription(project) {
    const descriptionTitle = document.querySelector('.portfolio-description h2');
    const descriptionText = document.querySelector('.portfolio-description p');
    
    if (descriptionTitle) {
      descriptionTitle.textContent = project.title;
    }
    
    if (descriptionText) {
      descriptionText.textContent = project.fullDescription;
    }
  }

  /**
   * 初始化專案詳情頁
   */
  async initDetailsPage() {
    await this.loadPortfolioData();
    const projectId = this.getProjectIdFromURL();
    
    if (projectId) {
      const project = this.getProjectById(projectId);
      if (project) {
        this.renderProjectDetails(project);
      } else {
        console.error(`Project with id "${projectId}" not found`);
      }
    } else {
      console.error('No project ID provided in URL');
    }
  }

  /**
   * 在首頁生成 portfolio 項目列表
   */
  async renderPortfolioList(containerSelector) {
    await this.loadPortfolioData();
    const container = document.querySelector(containerSelector);
    
    if (!container || !this.portfolioData) return;

    container.innerHTML = '';

    this.portfolioData.forEach(project => {
      const projectItem = this.createPortfolioItem(project);
      container.appendChild(projectItem);
    });

    this.reinitializeIsotope();
  }

  /**
   * 創建單個 portfolio 項目 HTML
   */
  createPortfolioItem(project) {
    const item = document.createElement('div');
    const filterClass = project.filter ? `filter-${project.filter}` : '';
    const thumbnail = project.thumbnail || (project.images && project.images[0]) || '';
    
    item.className = 'col-lg-4 col-md-6 portfolio-item isotope-item ' + filterClass;
    //item.setAttribute('data-aos', 'fade-up');
    
    item.innerHTML = `
      <div class="portfolio-content h-100">
        <img src="${thumbnail}" class="img-fluid" alt="${project.title}">
        <div class="portfolio-info">
          <h4>${project.title}</h4>
          <p>${project.description || ''}</p>
          <a href="${thumbnail}" title="${project.title}" data-gallery="portfolio-gallery-${project.filter || 'default'}" class="glightbox preview-link">
            <i class="bi bi-zoom-in"></i>
          </a>
          <a href="portfolio-details.html?id=${project.id}" title="More Details" class="details-link">
            <i class="bi bi-link-45deg"></i>
          </a>
        </div>
      </div>
    `;

    return item;
  }

  /**
   * 重新初始化 Isotope 和 AOS
   */
  reinitializeIsotope() {
    const isotopeContainer = document.querySelector('.isotope-container');
    if (!isotopeContainer) return;

    if (typeof imagesLoaded !== 'undefined') {
      imagesLoaded(isotopeContainer, () => {
        setTimeout(() => {
          const isotopeLayout = document.querySelector('.isotope-layout');
          if (isotopeLayout && typeof Isotope !== 'undefined') {
            const layout = isotopeLayout.getAttribute('data-layout') || 'masonry';
            const filter = isotopeLayout.getAttribute('data-default-filter') || '*';
            
            if (isotopeContainer.isotope) {
              isotopeContainer.isotope.destroy();
            }

            const initIsotope = new Isotope(isotopeContainer, {
              itemSelector: '.isotope-item',
              layoutMode: layout,
              filter: filter
            });

            const filterButtons = document.querySelectorAll('.isotope-filters li');
            filterButtons.forEach(button => {
              const newButton = button.cloneNode(true);
              button.parentNode.replaceChild(newButton, button);
              
              newButton.addEventListener('click', function() {
                document.querySelector('.isotope-filters .filter-active')?.classList.remove('filter-active');
                this.classList.add('filter-active');
                initIsotope.arrange({
                  filter: this.getAttribute('data-filter')
                });
                if (typeof AOS !== 'undefined' && typeof aosInit === 'function') {
                  aosInit();
                }
              });
            });
          }

          if (typeof AOS !== 'undefined' && typeof aosInit === 'function') {
            aosInit();
          }

          if (typeof GLightbox !== 'undefined') {
            GLightbox({
              selector: '.glightbox'
            });
          }
        }, 200);
      });
    }
  }
}

// 如果是在 portfolio-details.html 頁面，自動初始化
if (document.querySelector('.portfolio-details-page')) {
  const portfolioLoader = new PortfolioLoader();
  portfolioLoader.initDetailsPage();
}

// 如果是在首頁，等待所有資源載入完成後生成 portfolio 列表
if (document.querySelector('.isotope-container')) {
  if (document.readyState === 'complete') {
    setTimeout(() => {
      const portfolioLoader = new PortfolioLoader();
      portfolioLoader.renderPortfolioList('.isotope-container');
    }, 300);
  } else {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const portfolioLoader = new PortfolioLoader();
        portfolioLoader.renderPortfolioList('.isotope-container');
      }, 300);
    });
  }
}
