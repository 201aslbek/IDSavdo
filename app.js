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
