document.addEventListener('DOMContentLoaded', async () => {
  const settings = await fetch('/src/settings.json').then(res => res.json());

  const tabContainer = document.getElementById('tabContainer');
  const apiLinks = document.getElementById('apiLinks');
  const apiContent = document.getElementById('apiContent');

  const responseModal = new bootstrap.Modal(document.getElementById('apiResponseModal'));
  const endpointDisplay = document.getElementById('apiEndpoint');
  const queryContainer = document.getElementById('apiQueryInputContainer');
  const submitBtn = document.getElementById('submitQueryBtn');
  const responseContent = document.getElementById('apiResponseContent');
  const responseLoading = document.getElementById('apiResponseLoading');
  const modalDesc = document.getElementById('apiResponseModalDesc');

  let categories = settings.categories;
  let activeCategory = categories[0].name;

  // Tampilkan tab kategori
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.name;
    btn.className = 'btn btn-sm tab-btn btn-outline-primary';
    btn.addEventListener('click', () => {
      activeCategory = cat.name;
      renderEndpoints(cat.items);
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    tabContainer.appendChild(btn);
  });

  // Auto klik pertama
  tabContainer.querySelector('button')?.click();

  function renderEndpoints(items) {
    apiLinks.innerHTML = '';
    items.forEach(api => {
      const card = document.createElement('div');
      card.className = 'p-3 border rounded shadow-sm fade-in api-item';
      card.style.minWidth = '240px';
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="fw-semibold">${api.name}</div>
        <small class="text-muted">${api.desc || ''}</small>
        <div><span class="badge text-bg-primary mt-2">GET</span></div>
      `;

      card.addEventListener('click', () => openModal(api));
      apiLinks.appendChild(card);
    });

    requestAnimationFrame(() => {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.remove('show'));
      setTimeout(() => {
        document.querySelectorAll('.fade-in').forEach(el => el.classList.add('show'));
      }, 50);
    });
  }
  function openModal(api) {
  const hasQuery = api.path.includes("?");
  const [baseUrl, queryString] = api.path.split("?");
  const queryKeys = queryString?.split("&").map(p => p.split("=")[0]).filter(k => k) || [];

  // Hapus '/src' dari tampilan endpoint
  endpointDisplay.textContent = api.path.replace(/^\/src/, '');
  modalDesc.textContent = api.innerDesc || '';
  responseContent.classList.add('d-none');
  responseContent.textContent = '';
  queryContainer.innerHTML = '';
  submitBtn.classList.add('d-none');
  submitBtn.disabled = true;

  if (hasQuery && queryKeys.length) {
    queryKeys.forEach(param => {
      const group = document.createElement('div');
      group.className = 'form-group mb-2';
      group.innerHTML = `
        <label class="form-label">${param}</label>
        <input type="text" class="form-control" id="query-${param}" placeholder="${param}" />
      `;
      queryContainer.appendChild(group);
    });

    submitBtn.classList.remove('d-none');
    submitBtn.disabled = false;

    submitBtn.onclick = async () => {
      const queryStr = queryKeys
        .map(p => `${p}=${encodeURIComponent(document.getElementById(`query-${p}`).value)}`)
        .join('&');
      const fullUrl = `${baseUrl}?${queryStr}`;
      responseLoading.classList.remove('d-none');
      responseContent.classList.add('d-none');

      try {
        const res = await fetch(fullUrl);
        const data = await res.text();
        responseContent.textContent = isJson(data) ? JSON.stringify(JSON.parse(data), null, 2) : data;
      } catch (e) {
        responseContent.textContent = `Error: ${e.message}`;
      }

      responseLoading.classList.add('d-none');
      responseContent.classList.remove('d-none');
    };
  }

  responseModal.show();
  }

  function isJson(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
});
