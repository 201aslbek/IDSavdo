// --- 1. MA'LUMOTLAR VA O'ZGARUVCHILAR ---
let products = JSON.parse(localStorage.getItem("products")) || [];
let banners = JSON.parse(localStorage.getItem("banners")) || [];
let uploadedImages = []; // 5 ta rasm uchun vaqtinchalik joy
let currentStep = 1;

// --- 2. SAHIFA VA MODAL BOSHQARUVI ---
function openTab(pageId, btn) {
    // Barcha sahifalarni yashirish
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.style.display = "none";
    });

    // Tanlangan sahifani ko'rsatish
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add("active");
        activePage.style.display = "block";
    }

    // Pastki menyu tugmalarini aktiv qilish
    if (btn) {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }
}

// Modal ochish-yopish
function openModal() {
    document.getElementById("sellModal").style.display = "block";
    resetSteps(); // Har safar 1-qadamdan boshlansin
}

function closeModal() {
    document.getElementById("sellModal").style.display = "none";
}

function openBannerModal() {
    document.getElementById("bannerModal").style.display = "block";
}

function closeBannerModal() {
    document.getElementById("bannerModal").style.display = "none";
}

// Multi-step (bosqichma-bosqich) o'tish
function nextStep(step) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
}

function resetSteps() {
    currentStep = 1;
    uploadedImages = [];
    if(document.getElementById('imageList')) document.getElementById('imageList').innerHTML = "";
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
}

// --- 3. RASMLAR BILAN ISHLASH (5 TAGACHA) ---
function handleMultipleImages(input) {
    if (input.files && input.files[0]) {
        if (uploadedImages.length >= 5) {
            alert("Maksimal 5 ta rasm yuklash mumkin!");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImages.push(e.target.result);
            renderImagePreviews();
            input.value = ""; // Inputni tozalash
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function renderImagePreviews() {
    const list = document.getElementById('imageList');
    if (!list) return;

    list.innerHTML = uploadedImages.map((img, index) => `
        <div class="preview-wrapper" style="position: relative; width: 80px; height: 80px; margin: 5px;">
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
            <span onclick="removeImage(${index})" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px;">×</span>
        </div>
    `).join("");

    // 5 ta bo'lsa "+" tugmasini yashirish
    const addBox = document.getElementById('addMoreBox');
    if (addBox) addBox.style.display = (uploadedImages.length >= 5) ? 'none' : 'flex';
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    renderImagePreviews();
}

// --- 4. KATEGORIYA VA ALOQA MANTIQI ---
function selectCat(cat) {
    const input = document.getElementById('selectedCategory');
    if(input) input.value = cat;
    nextStep(4); // Kategoriya tanlangach narxga o'tadi
}

function toggleContactInput() {
    const typeRadio = document.querySelector('input[name="contactType"]:checked');
    const input = document.getElementById('contactValue');
    if (!typeRadio || !input) return;

    if (typeRadio.value === 'phone') {
        input.placeholder = "+998 90 123 45 67";
        input.type = "number";
    } else {
        input.placeholder = "@username";
        input.type = "text";
    }
}

// --- 5. E'LONNI YAKUNIY SAQLASH ---
function finishPosting() {
    const title = document.getElementById('productName').value;
    const category = document.getElementById('selectedCategory').value;
    const price = document.getElementById('productPrice').value;
    const currency = document.getElementById('currency').value;
    const desc = document.getElementById('productDesc').value;
    const sellerName = document.getElementById('contactName').value;
    const contactVal = document.getElementById('contactValue').value;
    const contactTypeRadio = document.querySelector('input[name="contactType"]:checked');

    // Tekshirishlar
    if (uploadedImages.length === 0) return alert("Kamida 1 ta rasm yuklang!");
    if (!title || !price || !contactVal) return alert("Ma'lumotlar to'liq emas!");
    if (!contactTypeRadio) return alert("Aloqa turini tanlang!");

    const newAd = {
        id: Date.now(),
        name: title,
        category: category || "Boshqa",
        price: price + " " + currency,
        desc: desc,
        images: uploadedImages,
        image: uploadedImages[0], // Galereyada 1-rasm asosiy bo'ladi
        sellerName: sellerName,
        contact: contactVal,
        contactType: contactTypeRadio.value,
        liked: false
    };

    products.push(newAd);
    localStorage.setItem("products", JSON.stringify(products));

    alert("E'lon muvaffaqiyatli joylandi!");
    location.reload(); // Hammasini yangilab sahifaga qaytadi
}

// --- 6. BANNER JOYLAH ---
function previewBanner(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = e => {
            document.getElementById('bannerPreview').innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveBanner() {
    const imgElement = document.querySelector('#bannerPreview img');
    if (!imgElement) return alert("Banner uchun rasm tanlang!");

    banners.push(imgElement.src);
    localStorage.setItem("banners", JSON.stringify(banners));
    
    alert("Banner muvaffaqiyatli qo'shildi!");
    location.reload();
}

// --- 7. EKRANGA CHIQARISH (RENDER) ---
function showProducts() {
    const container = document.getElementById("products");
    if (!container) return;

    container.innerHTML = products.map((p) => `
        <div class="product-card">
            <img src="${p.image}" onclick="alert('Batafsil ma\\'lumot: ' + '${p.desc}')">
            <h3>${p.name}</h3>
            <p class="category">${p.category}</p>
            <p class="price">${p.price}</p>
            <button class="buy-btn" onclick="handleBuyAction(${p.id})">Sotib olish</button>
        </div>
    `).join("");
}

function renderBanners() {
    const container = document.getElementById("bannerContainer");
    if (!container || banners.length === 0) return;

    container.innerHTML = banners.map(src => `
        <div class="swiper-slide">
            <img src="${src}" style="width:100%; height:100%; object-fit:cover; border-radius:25px;">
        </div>
    `).join("");

    if (typeof Swiper !== 'undefined') {
        new Swiper(".mySwiper", { autoplay: { delay: 3000 }, loop: true });
    }
}

function renderMyProducts() {
    const container = document.getElementById("myProducts");
    if (!container) return;

    container.innerHTML = products.map((p, i) => `
        <div class="my-product-card" style="display:flex; align-items:center; margin-bottom:10px; border:1px solid #eee; padding:5px; border-radius:10px;">
            <img src="${p.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px; margin-right:10px;">
            <p style="flex:1;">${p.name}</p>
            <button onclick="deleteProduct(${i})" style="background:red; color:white; border:none; padding:5px 10px; border-radius:5px;">O'chirish</button>
        </div>
    `).join("");
}

function deleteProduct(index) {
    if (confirm("Ushbu e'lonni o'chirmoqchimisiz?")) {
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));
        location.reload();
    }
}

// --- 8. SOTIB OLISH (YO'NALTIRISH) ---
function handleBuyAction(adId) {
    const ad = products.find(p => p.id == adId);
    if (!ad) return;

    if (ad.contactType === 'phone') {
        window.location.href = `tel:${ad.contact.replace(/\s+/g, '')}`;
    } else {
        const username = ad.contact.replace('@', '');
        window.location.href = `https://t.me/${username}`;
    }
}

// --- 9. OVOZLI VA DASTLABKI YUKLASH ---
const clickSound = new Audio("click.mp3");
function playClick() { clickSound.currentTime = 0; clickSound.play(); }

window.onload = () => {
    showProducts();
    renderBanners();
    renderMyProducts();
    
    // Agar profil sahifasida bannerlar ro'yxati bo'lsa
    if(typeof renderProfileBanners === "function") renderProfileBanners();
};
function finishPosting() {
    // 1. Elementlarni rasmdagi IDlar bo'yicha olish
    const title = document.getElementById('productName')?.value;
    const category = document.getElementById('selectedCategory')?.value;
    const price = document.getElementById('productPrice')?.value;
    const currency = document.getElementById('currency')?.value || "So'm";
    const desc = document.getElementById('productDesc')?.value;
    const sellerName = document.querySelector('input[placeholder="Ism"]')?.value || document.getElementById('contactName')?.value;
    
    // Aloqa turi va qiymatini olish
    const contactVal = document.getElementById('contactValue')?.value || document.querySelector('input[placeholder="@username"]')?.value;
    const contactTypeRadio = document.querySelector('input[name="contactType"]:checked');

    // 2. Tekshirish (Kamida bitta rasm va majburiy maydonlar)
    if (uploadedImages.length === 0) {
        alert("Iltimos, kamida bitta rasm yuklang!");
        return;
    }
    if (!title || !price || !contactVal) {
        alert("Sarlavha, narx va aloqa ma'lumotlarini to'ldiring!");
        return;
    }

    // 3. Yangi e'lon obyekti
    const newAd = {
        id: Date.now(),
        name: title,
        category: category || "Boshqa",
        price: price + " " + currency,
        desc: desc || "",
        images: uploadedImages, // 10 tagacha rasm massivi
        image: uploadedImages[0], // Bosh sahifa uchun asosiy rasm
        sellerName: sellerName,
        contact: contactVal,
        contactType: contactTypeRadio ? contactTypeRadio.value : 'telegram',
        liked: false
    };

    // 4. LocalStorage-ga saqlash
    products.push(newAd);
    localStorage.setItem("products", JSON.stringify(products));

    // 5. Muvaffaqiyatli yakunlash
    alert("E'lon muvaffaqiyatli joylandi!");
    
    // Tozalash va sahifani yangilash
    uploadedImages = [];
    closeModal();
    location.reload(); 
}
// --- BANNERLARNI SAQLASH VA BOSHQARISH ---

// 1. Banner uchun rasm tanlanganda ko'rsatish
function previewBanner(input) {
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            const previewContainer = document.getElementById('bannerPreview');
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" id="tempBannerImg" 
                         style="width:100%; height:150px; object-fit:cover; border-radius:15px;">
                `;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 2. Bannerni saqlash (Rasm + Link)
function saveBanner() {
    const imgElement = document.getElementById('tempBannerImg');
    const linkInput = document.getElementById('bannerLink'); // HTMLda shu IDli input bo'lishi kerak

    if (!imgElement) {
        alert("Iltimos, avval rasm tanlang!");
        return;
    }

    const newBanner = {
        id: Date.now(),
        image: imgElement.src,
        link: linkInput ? linkInput.value.trim() : "" // Link bo'lsa oladi, bo'lmasa bo'sh qoladi
    };

    // LocalStorage-ga saqlash
    banners.push(newBanner);
    localStorage.setItem("banners", JSON.stringify(banners));

    alert("Banner muvaffaqiyatli qo'shildi!");
    
    // Tozalash va yopish
    if (linkInput) linkInput.value = "";
    closeBannerModal();
    renderBanners(); // Asosiy sahifani yangilash
}

// 3. Bannerni ekranga chiqarish (Link bilan)
function renderBanners() {
    const container = document.getElementById("bannerContainer");
    if (!container || banners.length === 0) return;

    container.innerHTML = banners.map(b => {
        // Agar link bo'lsa 'onclick' qo'shamiz, bo'lmasa shunchaki rasm
        const clickAction = b.link ? `onclick="window.open('${b.link}', '_blank')"` : "";
        const cursorStyle = b.link ? "cursor: pointer;" : "";

        return `
            <div class="swiper-slide">
                <img src="${b.image}" ${clickAction} 
                     style="width:100%; height:100%; object-fit:cover; border-radius:25px; ${cursorStyle}">
            </div>
        `;
    }).join("");

    // Swiperni qayta ishga tushirish
    if (typeof Swiper !== 'undefined') {
        if (window.mySwiperInstance) window.mySwiperInstance.destroy();
        window.mySwiperInstance = new Swiper(".mySwiper", {
            autoplay: { delay: 3000, disableOnInteraction: false },
            loop: banners.length > 1,
        });
    }
}
// 1. Mening e'lonlarimni ko'rsatish funksiyasi
function showMyAds() {
    const list = document.getElementById('listItems'); // Ro'yxat chiqadigan joy
    const container = document.getElementById('myContentList'); // Modal oyna
    const title = document.getElementById('listTitle');

    if (!list || !container) return;

    title.innerText = "Mening E'lonlarim";
    
    // Faqat o'zingizga tegishli e'lonlarni chiqarish
    // Eslatma: Hozircha hamma e'lonlar localda bo'lgani uchun 'products'dan olamiz
    list.innerHTML = products.length === 0 ? 
        "<p style='text-align:center; padding:20px;'>Sizda hali e'lonlar yo'q.</p>" : 
        products.map((p, i) => `
            <div class="my-ad-card" style="display:flex; align-items:center; gap:12px; padding:15px; border-bottom:1px solid #eee; background:#fff; margin-bottom:10px; border-radius:12px;">
                <img src="${p.image}" style="width:70px; height:70px; object-fit:cover; border-radius:10px;">
                <div style="flex:1;">
                    <h4 style="margin:0; font-size:16px;">${p.name}</h4>
                    <p style="margin:5px 0; color:#b5007d; font-weight:bold;">${p.price}</p>
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                    <button onclick="openEditModal(${i})" style="background:#4a00e0; color:white; border:none; padding:6px 12px; border-radius:8px; font-size:12px;">Tahrirlash</button>
                    <button onclick="deleteProduct(${i})" style="background:#ff0040; color:white; border:none; padding:6px 12px; border-radius:8px; font-size:12px;">O'chirish</button>
                </div>
            </div>
        `).join("");
    
    container.style.display = "block";
}

// 2. Tahrirlash oynasini ochish
let editingIndex = null;
function openEditModal(index) {
    editingIndex = index;
    const p = products[index];
    
    // Prompt orqali oddiy tahrirlash (yoki alohida modal yasash mumkin)
    const newName = prompt("Yangi sarlavha:", p.name);
    const newPrice = prompt("Yangi narx:", p.price);
    
    if (newName !== null && newPrice !== null) {
        products[index].name = newName;
        products[index].price = newPrice;
        
        // Saqlash
        localStorage.setItem("products", JSON.stringify(products));
        alert("O'zgarishlar saqlandi!");
        showMyAds(); // Ro'yxatni yangilash
        showProducts(); // Asosiy sahifani yangilash
    }
}

// 3. E'lonni o'chirish
function deleteProduct(index) {
    if(confirm("Ushbu e'lonni butunlay o'chirmoqchimisiz?")) {
        products.splice(index, 1);
        localStorage.setItem("products", JSON.stringify(products));
        showMyAds(); // Ro'yxatni yangilash
        showProducts(); // Bosh sahifani yangilash
        alert("E'lon o'chirildi.");
    }
}
function showMyBanners() {
    const list = document.getElementById('listItems'); 
    const container = document.getElementById('myContentList');
    const title = document.getElementById('listTitle');

    if (!list || !container) return;

    if (title) title.innerText = "Mening Bannerlarim";
    
    // Bannerlar ro'yxatini shakllantirish
    list.innerHTML = banners.length === 0 ? 
        "<p style='text-align:center; padding:20px; color:#888;'>Sizda hali bannerlar yo'q.</p>" : 
        banners.map((b, i) => `
            <div class="my-banner-card" style="background:#fff; border-radius:15px; padding:15px; margin-bottom:15px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                <div style="position:relative;">
                    <img src="${b.image}" style="width:100%; height:120px; object-fit:cover; border-radius:10px;">
                    <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5); color:white; padding:2px 8px; border-radius:5px; font-size:10px;">
                        Banner #${i + 1}
                    </div>
                </div>
                
                <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1; overflow:hidden; margin-right:10px;">
                        <p style="margin:0; font-size:12px; color:#666; white-space:nowrap; text-overflow:ellipsis;">
                            <strong>Havola:</strong> ${b.link ? b.link : 'Biriktirilmagan'}
                        </p>
                    </div>
                    
                    <button onclick="deleteMyBanner(${i})" 
                            style="background:#ff0040; color:white; border:none; padding:8px 15px; border-radius:10px; cursor:pointer; font-weight:bold; font-size:12px; display:flex; align-items:center; gap:5px;">
                        <span>O'chirish</span>
                    </button>
                </div>
            </div>
        `).join("");
    
    container.style.display = "block";
}

// Bannerni o'chirish funksiyasi
function deleteMyBanner(index) {
    if (confirm("Ushbu bannerni butunlay o'chirib tashlamoqchimisiz?")) {
        // 1. Massivdan o'chirish
        banners.splice(index, 1);
        
        // 2. LocalStorage-ni yangilash
        localStorage.setItem("banners", JSON.stringify(banners));
        
        // 3. Ekranni yangilash
        showMyBanners(); // Profil ichidagi ro'yxatni yangilaydi
        if (typeof renderBanners === "function") renderBanners(); // Bosh sahifadagi sliderni yangilaydi
        
        alert("Banner o'chirildi.");
    }
}
function finishPosting() {
    console.log("Tugma bosildi!"); // Tekshirish uchun

    // 1. Elementlarni olish
    const elName = document.getElementById('productName');
    const elPrice = document.getElementById('productPrice');
    const elContact = document.getElementById('contactValue');

    // 2. Eng muhim elementlar borligini tekshirish
    if (!elName || !elPrice || !elContact) {
        alert("XATO: HTML faylingizda 'productName', 'productPrice' yoki 'contactValue' ID-lari topilmadi!");
        return;
    }

    // 3. Qiymatlarni olish
    const title = elName.value.trim();
    const price = elPrice.value.trim();
    const contact = elContact.value.trim();

    // 4. Rasmni tekshirish (uploadedImages massivi mavjudligini tekshirish)
    if (typeof uploadedImages === 'undefined' || uploadedImages.length === 0) {
        alert("Iltimos, avval rasm yuklang!");
        return;
    }

    if (!title || !price || !contact) {
        alert("Barcha maydonlarni to'ldiring!");
        return;
    }

    // 5. Obyekt yaratish va saqlash
    const newAd = {
        id: Date.now(),
        name: title,
        price: price,
        contact: contact,
        image: uploadedImages[0],
        images: [...uploadedImages]
    };

    // 'products' massivi borligini tekshirish
    if (typeof products === 'undefined') products = [];

    products.push(newAd);
    localStorage.setItem("products", JSON.stringify(products));

    alert("E'lon muvaffaqiyatli joylandi!");
    location.reload(); // Sahifani yangilash
}
document.addEventListener("DOMContentLoaded", function() {
    const btn = document.getElementById("submitBtn");
    if (btn) {
        btn.addEventListener("click", function() {
            console.log("Tugma bosildi!"); // Konsolda ko'rinishi kerak
            
            // Ma'lumotlarni yig'ish
            const name = document.getElementById('productName') ? document.getElementById('productName').value : "";
            const price = document.getElementById('productPrice') ? document.getElementById('productPrice').value : "";
            const contact = document.getElementById('contactValue') ? document.getElementById('contactValue').value : "";

            // Tekshirish
            if (!name || !price || !contact) {
                alert("Iltimos, maydonlarni to'ldiring!");
                return;
            }
            if (typeof uploadedImages === 'undefined' || uploadedImages.length === 0) {
                alert("Rasm yuklang!");
                return;
            }

            // Saqlash
            const ad = {
                id: Date.now(),
                name: name,
                price: price,
                contact: contact,
                image: uploadedImages[0]
            };

            let allProducts = JSON.parse(localStorage.getItem("products")) || [];
            allProducts.push(ad);
            localStorage.setItem("products", JSON.stringify(allProducts));

            alert("Muvaffaqiyatli saqlandi!");
            location.reload(); 
        });
    } else {
        console.error("submitBtn ID topilmadi!");
    }
});
function closeMyContent() {
    console.log("Yopish tugmasi bosildi"); // Bu konsolda chiqishi shart!
    
    const container = document.getElementById('myContentList');
    if (container) {
        container.style.display = "none";
        // Agar kerak bo'lsa, ichidagi narsalarni tozalab qo'yish
        document.getElementById('listItems').innerHTML = ""; 
    }
}
function showProducts() {
    const container = document.getElementById("products");
    container.innerHTML = products.map((p) => `
        <div class="product-card">
            <div class="card-image-container">
                <img src="${p.images[0]}" style="width:100%; height:200px; object-fit:cover;">
                <button class="fav-btn" onclick="toggleFav(${p.id})"><i class="far fa-heart"></i></button>
                <div class="dots-container">
                    ${p.images.map(() => '<span class="dot"></span>').join('')}
                </div>
            </div>
            <div class="card-body">
                <h3 class="product-name">${p.name}</h3>
                <span class="category-badge">${p.category}</span>
                <p class="product-price"><b>${p.price}</b></p>
                <p class="post-date">${p.date}</p>
            </div>
        </div>
    `).join("");
}
function showProducts() {
    const container = document.getElementById("products");
    container.innerHTML = products.map((p) => `
        <div class="product-card">
            <div class="card-image-container">
                <img src="${p.image}" style="width:100%; height:100%; object-fit:cover;">
                <button class="fav-btn" onclick="toggleFav(${p.id})">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="card-body">
                <div class="product-name">${p.name}</div>
                <span class="category-badge">${p.category}</span>
                <div class="product-price"><b>${p.price}</b></div>
                <div class="post-date">${p.date}</div>
            </div>
        </div>
    `).join("");
}
function showProducts() {
    const container = document.getElementById("products");
    
    container.innerHTML = products.map((p) => `
        <div class="product-card">
            <div class="swiper productSwiper">
                <div class="swiper-wrapper">
                    ${p.images.map(img => `
                        <div class="swiper-slide">
                            <img src="${img}" style="width:100%; height:120px; object-fit:cover;">
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination"></div>
                <button class="fav-btn" onclick="toggleFav(${p.id})"><i class="far fa-heart"></i></button>
            </div>
            
            <div class="card-body">
                <div class="product-name">${p.name}</div>
                <div class="product-price"><b>${p.price}</b></div>
                <div class="post-date">${p.date}</div>
            </div>
        </div>
    `).join("");

    // Kartalar chizilgandan keyin Swiper-ni ishga tushiramiz
    new Swiper(".productSwiper", {
        pagination: { el: ".swiper-pagination", clickable: true },
        loop: true
    });
}
function finishPosting() {
    // 1. Oxirgi IDni localStorage-dan olish (agar bo'lmasa, 0 dan boshlaydi)
    let lastId = parseInt(localStorage.getItem("lastAdId")) || 0;
    
    // 2. Yangi IDni hisoblash (1 ga oshirish)
    let newId = lastId + 1;

    // 3. E'lon obyektini yaratish
    const newAd = {
        id: newId, // Mana, endi ID 1 dan boshlanadi
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        // ... boshqa ma'lumotlar
    };

    // 4. E'lonni saqlash
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(newAd);
    localStorage.setItem("products", JSON.stringify(products));

    // 5. Oxirgi IDni yangilab saqlash
    localStorage.setItem("lastAdId", newId);

    alert("E'lon muvaffaqiyatli joylandi! ID: " + newId);
    location.reload();
}
function showProducts() {
    const container = document.getElementById("products");
    if (!container) return; // Agar HTMLda "products" IDli div bo'lmasa, to'xtaydi

    const savedProducts = localStorage.getItem("products");
    if (!savedProducts) {
        container.innerHTML = "<p>Hali e'lonlar yo'q</p>";
        return;
    }

    try {
        const products = JSON.parse(savedProducts);
        
        container.innerHTML = products.map((p) => `
            <div class="product-card">
                <img src="${p.image || ''}" style="width:100%; height:120px; object-fit:cover;">
                <div class="card-body">
                    <div class="product-name">${p.name || 'Nomsiz'}</div>
                    <div class="product-price"><b>${p.price || '0'}</b></div>
                </div>
            </div>
        `).join("");
    } catch (e) {
        console.error("Ma'lumotlarni o'qishda xatolik:", e);
        container.innerHTML = "<p>E'lonlarni yuklashda xatolik yuz berdi.</p>";
    }
}
// Frontenddagi yangilangan funksiya (Backendga yuborish uchun)
async function finishPosting() {
    const newAd = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        // ... boshqa maydonlar
    };

    // Serverga yuborish
    const response = await fetch('https://sizning-serveringiz.com/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAd)
    });

    if (response.ok) {
        alert("E'lon muvaffaqiyatli serverga yuklandi!");
    }
}
function showProducts() {
    const container = document.getElementById("products");
    if (!container) return;

    // LocalStorage-dan ma'lumotni olish
    let products = JSON.parse(localStorage.getItem("products")) || [];

    if (products.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>Hali e'lonlar yo'q</p>";
        return;
    }

    container.innerHTML = products.map((p) => {
        // Rasm borligini tekshirish
        const mainImg = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'placeholder.jpg');
        
        return `
        <div class="product-card" onclick="openAdDetail(${p.id})">
            <div class="card-image-container" style="position:relative;">
                <img src="${mainImg}" style="width:100%; height:150px; object-fit:cover; border-radius:10px 10px 0 0;">
                <button class="fav-btn" onclick="event.stopPropagation(); toggleLike(${p.id})" 
                        style="position:absolute; top:8px; right:8px; background:white; border:none; border-radius:50%; width:30px; height:30px; cursor:pointer;">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="card-body" style="padding:10px;">
                <div class="product-name" style="font-size:14px; font-weight:bold; height:40px; overflow:hidden;">${p.name}</div>
                <div class="product-price" style="color:#b5007d; font-weight:800; margin-top:5px;">${p.price}</div>
                <div class="post-date" style="font-size:10px; color:gray; margin-top:5px;">${p.date || 'Bugun'}</div>
            </div>
        </div>
        `;
    }).join("");
}
function openAdDetail(id) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    const ad = products.find(p => p.id == id);
    if (!ad) return alert("E'lon topilmadi!");

    // 1. Home sahifasini yashirish, Detail sahifasini ko'rsatish
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    const detailPage = document.getElementById('detailPage');
    if(detailPage) detailPage.style.display = "block";

    // 2. Ma'lumotlarni joylashtirish (Har birini borligini tekshirib)
    if(document.getElementById('d-title')) document.getElementById('d-title').innerText = ad.name;
    if(document.getElementById('d-price')) document.getElementById('d-price').innerText = ad.price;
    if(document.getElementById('d-desc')) document.getElementById('d-desc').innerText = ad.desc || "Tavsif yo'q";
    if(document.getElementById('d-id')) document.getElementById('d-id').innerText = "ID: " + ad.id;

    // 3. Rasmlarni chiqarish
    const imgContainer = document.getElementById('d-images');
    if(imgContainer) {
        imgContainer.innerHTML = ad.images.map(img => `
            <div class="swiper-slide"><img src="${img}" style="width:100%; border-radius:15px;"></div>
        `).join('');
        
        // Swiperni yangilash
        if(typeof Swiper !== 'undefined') {
            new Swiper(".detailSwiper", { pagination: { el: ".swiper-pagination" } });
        }
    }
}
function openAdDetail(id) {
    // 1. Ma'lumotni qidiramiz
    const ad = products.find(p => p.id == id);
    if (!ad) {
        alert("Xato: E'lon topilmadi!");
        return;
    }

    try {
        // 2. Sahifani ko'rsatish
        document.querySelectorAll(".page").forEach(p => p.style.display = "none");
        const detailPage = document.getElementById('detailPage');
        if (detailPage) detailPage.style.display = "block";

        // 3. Matnlarni to'ldirish (Agar ID bo'lsa)
        const updateText = (elId, text) => {
            const el = document.getElementById(elId);
            if (el) el.innerText = text;
        };

        updateText('d-title', ad.name);
        updateText('d-price', ad.price);
        updateText('d-date', ad.date || "21 February 2026");
        updateText('d-desc', ad.desc || "Tavsif kiritilmagan.");
        updateText('d-cat', "Quyitoifalar: " + (ad.category || "Velosipedlar"));
        updateText('d-username', ad.sellerName || "user");
        updateText('d-id', "id:" + ad.id);
        updateText('d-views', ad.views || "100");

        // 4. Rasmlarni yuklash (Swiper uchun)
        const imgBox = document.getElementById('d-images');
        if (imgBox) {
            const allImages = ad.images && ad.images.length > 0 ? ad.images : [ad.image];
            imgBox.innerHTML = allImages.map(img => `
                <div class="swiper-slide">
                    <img src="${img}" style="width:100%; height:300px; object-fit:cover;">
                </div>
            `).join('');

            // Swiperni ishga tushirish (agar 1 tadan ko'p bo'lsa)
            new Swiper(".detailSwiper", {
                pagination: { el: ".swiper-pagination" },
                loop: allImages.length > 1
            });
        }

        // 5. Sotib olish tugmasi
        const btn = document.getElementById('contact-link');
        if (btn) {
            if (ad.contactType === 'phone') {
                btn.href = `tel:${ad.contact}`;
                btn.innerText = "Qo'ng'iroq qilish";
            } else {
                btn.href = `https://t.me/${ad.contact.replace('@', '')}`;
                btn.innerText = "Telegramda yozish";
            }
        }
        
    } catch (err) {
        console.error("Xatolik yuz berdi:", err);
        alert("Sahifani yuklashda xato!");
    }
}

// Orqaga qaytish funksiyasi
function closeAdDetail() {
    document.getElementById('detailPage').style.display = "none";
    document.getElementById('home').style.display = "block"; // Bosh sahifa IDsi
}
function showProducts() {
    const container = document.getElementById("products");
    if (!container) return;

    container.innerHTML = products.map((p) => `
        <div class="product-card" onclick="openAdDetail(${p.id})" style="background:#fff; border-radius:8px; overflow:hidden; position:relative; border:1px solid #eee;">
            <img src="${p.image}" style="width:100px; height:100px;">
            <div style="position:absolute; top:8px; right:8px; background:rgba(255,255,255,0.8); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:#002f34;">
                <i class="far fa-heart"></i>
            </div>
            <div style="padding:10px;">
                <div style="font-size:14px; font-weight:500; height:36px; overflow:hidden; line-height:1.3; color:#002f34;">${p.name}</div>
                <div style="font-size:16px; font-weight:bold; margin:5px 0; color:#002f34;">${p.price}</div>
                <div style="font-size:11px; color:#7f9799;">${p.date || 'Bugun'}</div>
            </div>
        </div>
    `).join("");
}
function finishPosting() {
    const priceValue = document.getElementById('productPrice').value;
    const currencyValue = document.getElementById('currency').value; // Masalan: "so'm" yoki "$"

    if (!priceValue) return alert("Narxni kiriting!");

    // Narxni formatlash (masalan: "500 000 so'm")
    const formattedPrice = Number(priceValue).toLocaleString('ru-RU') + " " + currencyValue;

    const newAd = {
        // ... boshqa ma'lumotlar
        price: formattedPrice, // Endi narx "500 000 so'm" ko'rinishida saqlanadi
    };

    // Saqlash logikasi...
}
function formatCurrency(amount, type) {
    let formatted = new Intl.NumberFormat('sr-RS').format(amount).replace(/,/g, ' ');
    return type === '$' ? `$ ${formatted}` : `${formatted} so'm`;
}

// Ishlatish:
// console.log(formatCurrency(450000, 'so'm')); // "450 000 so'm"
// Qidiruv sahifasini ochish
function openSearchPage() {
    document.getElementById('searchPage').style.display = 'block';
    document.getElementById('fullSearchInput').focus(); // Avtomatik klaviaturani chiqarish
}

// Qidiruv sahifasini yopish
function closeSearchPage() {
    document.getElementById('searchPage').style.display = 'none';
    document.getElementById('fullSearchInput').value = ''; // Qidiruvni tozalash
    document.getElementById('searchResults').innerHTML = ''; 
}

// Qidiruv funksiyasi (endilikda natijalarni searchResults diviga yozadi)
function liveSearch() {
    const query = document.getElementById('fullSearchInput').value.toLowerCase().trim();
    const resultsContainer = document.getElementById("searchResults");
    
    if (!query) {
        resultsContainer.innerHTML = "";
        return;
    }

    const filtered = products.filter(p => p.name.toLowerCase().includes(query));

    resultsContainer.innerHTML = filtered.map(p => `
        <div onclick="openAdDetail(${p.id}); closeSearchPage();" style="background:#fff; margin-bottom:10px; padding:10px; border-radius:10px; display:flex; align-items:center;">
            <img src="${p.image}" style="width:50px; height:50px; object-fit:cover; border-radius:5px; margin-right:10px;">
            <div>
                <div style="font-weight:bold;">${p.name}</div>
                <div style="color:#002f34;">${p.price}</div>
            </div>
        </div>
    `).join("");
}
function liveSearch() {
    const query = document.getElementById('fullSearchInput').value.toLowerCase().trim();
    const resultsContainer = document.getElementById("searchResults");
    
    // Grid klassini qo'shish
    resultsContainer.className = "product-grid"; 
    
    if (!query) {
        resultsContainer.innerHTML = "";
        return;
    }

    const filtered = products.filter(p => p.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
        resultsContainer.innerHTML = "<p style='grid-column: 1 / -1; text-align:center; padding:20px;'>Hech narsa topilmadi</p>";
        return;
    }

    resultsContainer.innerHTML = filtered.map(p => `
        <div class="product-card" onclick="openAdDetail(${p.id}); closeSearchPage();" style="background:#fff; border-radius:10px; overflow:hidden; border:1px solid #eee;">
            <img src="${p.image}" style="width:100%; height:140px; object-fit:cover;">
            <div style="padding:10px;">
                <div style="font-size:14px; font-weight:bold; height:36px; overflow:hidden;">${p.name}</div>
                <div style="color:#002f34; font-weight:bold; margin-top:5px;">${p.price}</div>
            </div>
        </div>
    `).join("");
}
function renderPremiumAds() {
    const container = document.getElementById("premiumContainer");
    let products = JSON.parse(localStorage.getItem("products")) || [];
    
    // Faqat premium deb belgilangan e'lonlarni olish
    const premiumAds = products.filter(p => p.isPremium);

    if (premiumAds.length === 0) {
        document.querySelector('.premium-section').style.display = 'none';
        return;
    }

    container.innerHTML = premiumAds.map(p => `
        <div class="swiper-slide premium-card" onclick="openAdDetail(${p.id})">
            <img src="${p.image}" style="width:100%; height:120px; object-fit:cover;">
            <div style="padding:8px;">
                <div style="font-size:12px; font-weight:bold;">${p.name}</div>
                <div style="color:#7f52ff; font-weight:bold;">${p.price}</div>
            </div>
        </div>
    `).join("");

    // Swiper-ni ishga tushirish (agar hali ishga tushmagan bo'lsa)
    new Swiper(".premiumSwiper", {
        slidesPerView: 2.2, // Bir qatorda 2 ta e'lon va keyingisining yarmi ko'rinadi
        spaceBetween: 10
    });
}
function postAd() {
    // Inputlardan ma'lumotlarni olish
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const desc = document.getElementById('productDesc').value;
    const isPremium = document.getElementById('isPremiumCheck').checked; // Checkbox holati

    if (!name || !price) return alert("Iltimos, maydonlarni to'ldiring!");

    // E'lon obyektini yaratish
    const newAd = {
        id: Date.now(),
        name: name,
        price: price + " so'm",
        desc: desc,
        isPremium: isPremium, // Mana shu joyi eng muhimi
        date: new Date().toLocaleDateString(),
        image: "https://via.placeholder.com/150" // Rasm yuklash funksiyasi bo'lsa uni oling
    };

    // LocalStorage-ga saqlash
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(newAd);
    localStorage.setItem("products", JSON.stringify(products));

    alert(isPremium ? "Premium e'loningiz muvaffaqiyatli joylandi!" : "E'loningiz joylandi!");
    
    // Bosh sahifaga qaytish
    location.reload(); 
}
function showProducts() {
    const container = document.getElementById("products");
    if (!container) return;

    let products = JSON.parse(localStorage.getItem("products")) || [];

    // FAQAT premium bo'lmaganlarni chiqaramiz
    const regularAds = products.filter(p => !p.isPremium);

    if (regularAds.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>Hozircha oddiy e'lonlar yo'q</p>";
        return;
    }

    container.innerHTML = regularAds.map((p) => `
        <div class="product-card" onclick="openAdDetail(${p.id})">
            <img src="${p.image}">
            <div class="product-name">${p.name}</div>
            <div class="product-price">${p.price}</div>
        </div>
    `).join("");
}
const categories = [
    "Telegram premium", "Telegram Starslar", "Telegram akkauntlar", 
    "Telegram kanal va guruxlar", "Telegram botlar", "Email akkauntlar",
    "Pubg akkauntlar", "Instagram akkauntlar", "Youtube akkauntlar",
    "Tiktok akkauntlar", "Facebook akkauntlar", "Telefon raqamlar", "Boshqa akkauntlar"
];

// Sahifani ochish
function openSearchPage() {
    document.getElementById('searchPage').style.display = 'block';
    document.getElementById('fullSearchInput').focus();
    loadCategories(); // Kategoriyalarni yuklash
}

// Sahifani yopish
function closeSearchPage() {
    document.getElementById('searchPage').style.display = 'none';
}

// Kategoriyalarni chiqarish
function loadCategories() {
    const list = document.getElementById("categoriesList");
    list.innerHTML = categories.map(cat => `
        <div onclick="filterByCategory('${cat}')" style="padding:15px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; cursor:pointer; align-items:center;">
            <span style="font-size: 15px;">${cat}</span>
            <span style="color:#ccc;">›</span>
        </div>
    `).join("");
}

// Qidiruv funksiyasi
function performSearch() {
    const query = document.getElementById('fullSearchInput').value.toLowerCase().trim();
    const resultsContainer = document.getElementById("searchResults");
    const catList = document.getElementById("categoryListContainer");
    
    if (!query) {
        resultsContainer.innerHTML = "";
        catList.style.display = "block";
        return;
    }

    catList.style.display = "none";
    let products = JSON.parse(localStorage.getItem("products")) || [];
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));

    resultsContainer.innerHTML = filtered.length > 0 
        ? filtered.map(p => `
            <div class="product-card" onclick="openAdDetail(${p.id}); closeSearchPage();" style="border:1px solid #eee; border-radius:10px; overflow:hidden;">
                <img src="${p.image}" style="width:100%; height:0px; object-fit:cover;">
                <div style="padding:8px;">
                    <div style="font-weight:bold; font-size:13px;">${p.name}</div>
                    <div style="color:#7f52ff; font-weight:bold; font-size:14px;">${p.price}</div>
                </div>
            </div>
        `).join("")
        : "<p style='text-align:center; color:gray;'>Natija topilmadi</p>";
}

// Kategoriyani bosganda
function filterByCategory(cat) {
    document.getElementById('fullSearchInput').value = cat;
    performSearch();
}
let startY = 0;
let pullDelta = 0;
let isRefreshing = false;

const container = document.getElementById('ptr-container');
const circle = container.querySelector('.ptr-circle');
const icon = container.querySelector('svg');

// 1. E'LONLARNI YANGILASH (Lentani qayta chizish)
function updateAdFeed() {
    const feedContainer = document.getElementById('ads-feed'); // E'lonlar turgan DIV ID-si
    if (!feedContainer) return;

    // LocalStorage-dan e'lonlarni olish
    const storedAds = JSON.parse(localStorage.getItem('myAds')) || [];
    
    // Lentani tozalash va qayta chizish
    feedContainer.innerHTML = ''; 

    if (storedAds.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center; padding:20px;">Hozircha e\'lonlar yo\'q</p>';
        return;
    }

    storedAds.reverse().forEach(ad => { // Yangilari tepada chiqishi uchun reverse()
        const adCard = `
            <div class="ad-card" style="margin-bottom: 15px; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 8px 0; color: #333;">${ad.title}</h3>
                <p style="font-size: 14px; color: #666; margin-bottom: 10px;">${ad.description || 'Tavsif yozilmagan'}</p>
                <div style="font-weight: bold; color: #700;">${ad.price} so'm</div>
                <div style="font-size: 11px; color: #999; margin-top: 5px;">Virtual mahsulot</div>
            </div>
        `;
        feedContainer.innerHTML += adCard;
    });
    console.log("Lenta yangilandi!");
}

// 2. REFRESH HARAKATLARI
window.addEventListener('touchstart', (e) => {
    const homePage = document.getElementById('home');
    const isHome = homePage && homePage.style.display !== 'none';

    if (isHome && window.scrollY <= 0 && !isRefreshing) {
        startY = e.touches[0].pageY;
        container.style.transition = 'none';
    } else {
        startY = 0;
    }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (startY === 0 || isRefreshing) return;

    const currentY = e.touches[0].pageY;
    pullDelta = currentY - startY;

    if (pullDelta > 10 && window.scrollY <= 0) {
        const y = Math.min(pullDelta * 0.4, 90);
        container.style.transform = `translateY(${y}px)`;
        icon.style.transform = `rotate(${pullDelta * 2}deg)`;
        
        if (e.cancelable) e.preventDefault();
    }
}, { passive: false });

window.addEventListener('touchend', () => {
    if (startY === 0 || isRefreshing) return;

    container.style.transition = 'transform 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.28)';

    if (pullDelta > 80) {
        isRefreshing = true;
        circle.classList.add('ptr-spinning');
        container.style.transform = `translateY(80px)`;

        // REFRESH QILISH: Sayt o'chmaydi, faqat lenta yangilanadi
        setTimeout(() => {
            updateAdFeed(); // Ma'lumotlarni bazadan qayta o'qish
            
            // Indikatorni yashirish
            container.style.transform = `translateY(0)`;
            setTimeout(() => {
                circle.classList.remove('ptr-spinning');
                isRefreshing = false;
                pullDelta = 0;
            }, 300);
        }, 1200);
    } else {
        container.style.transform = `translateY(0)`;
        pullDelta = 0;
    }
    startY = 0;
});

// Sahifa birinchi marta yuklanganda ham e'lonlarni ko'rsatish
document.addEventListener('DOMContentLoaded', updateAdFeed);
function searchAds() {
    // 1. Qidiruv so'zini olish
    const query = document.getElementById('main-search-input').value.toLowerCase();
    
    // 2. LocalStorage'dan hamma e'lonlarni olish
    const allAds = JSON.parse(localStorage.getItem('myAds')) || [];
    
    // 3. Filtrlash (Sarlavha yoki tavsif bo'yicha)
    const filteredAds = allAds.filter(ad => {
        return ad.title.toLowerCase().includes(query) || 
               (ad.description && ad.description.toLowerCase().includes(query));
    });

    // 4. Natijani ekranga chiqarish (Lentani yangilash)
    displaySearchResults(filteredAds);
}

// Qidiruv natijalarini render qilish funksiyasi
function displaySearchResults(results) {
    const feed = document.getElementById('ads-feed'); // E'lonlar konteyneri
    if (!feed) return;

    if (results.length === 0) {
        feed.innerHTML = '<p style="text-align:center; padding:50px; color:#666;">Hech narsa topilmadi...</p>';
        return;
    }

    feed.innerHTML = results.reverse().map(ad => `
        <div class="ad-card" style="margin-bottom: 15px; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 8px 0;">${ad.title}</h3>
            <p style="font-size: 14px; color: #666;">${ad.description || ''}</p>
            <div style="font-weight: bold; color: #007bff; margin-top: 10px;">${ad.price} so'm</div>
        </div>
    `).join('');
}
// 1. Enter tugmasi bosilganini tekshirish
function handleKeyPress(event) {
    if (event.key === "Enter") {
        searchAds(); // Enter bosilganda qidiruvni boshlaydi
    }
}

// 2. Qidiruv funksiyasi
function searchAds() {
    const query = document.getElementById('main-search-input').value.toLowerCase();
    const allAds = JSON.parse(localStorage.getItem('myAds')) || [];

    // Qidiruv so'zi bo'yicha filtrlash
    const filteredAds = allAds.filter(ad => {
        return ad.title.toLowerCase().includes(query) || 
               (ad.description && ad.description.toLowerCase().includes(query));
    });

    // Natijani ekranga chiqarish
    displaySearchResults(filteredAds);
}

// 3. Ekranga chiqaruvchi (Render) funksiya
function displaySearchResults(results) {
    const feed = document.getElementById('ads-feed');
    if (!feed) return;

    if (results.length === 0) {
        feed.innerHTML = '<p style="text-align:center; padding:50px; color:#666;">Hech narsa topilmadi...</p>';
        return;
    }

    feed.innerHTML = results.reverse().map(ad => `
        <div class="ad-card" style="margin-bottom: 15px; background: white; padding: 15px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 8px 0;">${ad.title}</h3>
            <p style="font-size: 14px; color: #666;">${ad.description || 'Tavsif yo\'q'}</p>
            <div style="font-weight: bold; color: #007bff; margin-top: 10px;">${ad.price} so'm</div>
        </div>
    `).join('');
}
// 1. Qidiruv oynasini ochish
function openSearch() {
    document.getElementById('search-overlay').style.display = 'flex';
    document.getElementById('live-search-input').focus(); // Avtomatik klaviaturani ochadi
}

// 2. Qidiruv oynasini yopish
function closeSearch() {
    document.getElementById('search-overlay').style.display = 'none';
}

// 3. Matnni tozalash
function clearSearch() {
    document.getElementById('live-search-input').value = '';
    liveSearch(); // Natijalarni ham tozalaydi
}

// 4. JONLI QIDIRUV (Har bir harf bosilganda ishlaydi)
function liveSearch() {
    const input = document.getElementById('live-search-input');
    const query = input.value.toLowerCase();
    const resultsContainer = document.getElementById('search-results-list');
    
    // Matn bo'sh bo'lsa natijalarni o'chirish
    if (query.length === 0) {
        resultsContainer.innerHTML = '';
        return;
    }

    // LocalStorage-dan e'lonlarni olish
    const ads = JSON.parse(localStorage.getItem('myAds')) || [];

    // Filtrlash (a -> barcha a qatnashganlar, as -> as qatnashganlar)
    const filtered = ads.filter(ad => 
        ad.title.toLowerCase().includes(query) || 
        (ad.description && ad.description.toLowerCase().includes(query))
    );

    // Natijalarni chiqarish
    resultsContainer.innerHTML = filtered.map(ad => `
        <div class="search-result-item">
            <h4 style="margin:0; color:#000;">${ad.title}</h4>
            <p style="margin:5px 0; font-size:13px; color:#444;">${ad.description || ''}</p>
            <b style="color:#007bff;">${ad.price} so'm</b>
        </div>
    `).join('');

    // Agar hech narsa topilmasa
    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align:center; color:#888;">Hech narsa topilmadi</p>';
    }
}
// AGAR SIZDA BOSHQA NOM BO'LSA, 'myAds' NI O'SHA NOMGA O'ZGARTIRING
const ads = JSON.parse(localStorage.getItem('myAds')) || []; 
const filtered = ads.filter(ad => 
    (ad.sarlavha && ad.sarlavha.toLowerCase().includes(query)) || // 'title' o'rniga 'sarlavha'
    (ad.tavsif && ad.tavsif.toLowerCase().includes(query))        // 'description' o'rniga 'tavsif'
);
function liveSearch() {
    const query = document.getElementById('live-search-input').value.toLowerCase();
    const ads = JSON.parse(localStorage.getItem('myAds')) || [];
    
    console.log("Qidirilmoqda:", query);
    console.log("Bazadagi e'lonlar:", ads);

    const filtered = ads.filter(ad => {
        const titleMatch = ad.title ? ad.title.toLowerCase().includes(query) : false;
        const descMatch = ad.description ? ad.description.toLowerCase().includes(query) : false;
        return titleMatch || descMatch;
    });

    console.log("Topilganlar soni:", filtered.length);
    // ... qolgan render kodi
}
// Render funksiyasi ichida
feed.innerHTML += `
    <div class="ad-card">
        <img src="${ad.image}" alt="${ad.title}"> <div class="ad-info" style="padding: 10px;">
            <h3 style="margin: 0; font-size: 16px;">${ad.title}</h3>
            <div style="font-weight: bold; font-size: 18px; margin-top: 5px;">${ad.price}</div>
        </div>
    </div>
`;
