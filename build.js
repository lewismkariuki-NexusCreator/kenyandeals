const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'products.json');
const TEMPLATE_HOME = path.join(__dirname, 'templates', 'home.html');
const TEMPLATE_PRODUCT = path.join(__dirname, 'templates', 'product.html');
const DIST_DIR = path.join(__dirname, 'dist');

// Read Database
const products = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Read Templates
const homeTemplate = fs.readFileSync(TEMPLATE_HOME, 'utf-8');
const productTemplate = fs.readFileSync(TEMPLATE_PRODUCT, 'utf-8');

// Ensure dist directory exists
if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR);

// Copy assets folder to dist
const srcAssets = path.join(__dirname, 'assets');
const distAssets = path.join(DIST_DIR, 'assets');
if (fs.existsSync(srcAssets)) {
    fs.cpSync(srcAssets, distAssets, { recursive: true });
}

// Generate Product Card HTML for Homepage Grid
function generateProductCard(p) {
    return `
    <div class="bg-white border border-slate-100 rounded-3xl p-6 product-card transition-all duration-300 flex flex-col">
        <div class="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
            <img src="${p.image}" class="w-3/4 h-3/4 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500">
            <span class="absolute top-3 left-3 bg-white text-indigo-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-100">${p.badge}</span>
        </div>
        <div class="flex-1">
            <div class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">${p.category}</div>
            <h3 class="font-bold text-slate-900 leading-tight mb-2"><a href="/${p.slug}" class="hover:text-indigo-600">${p.name}</a></h3>
            <div class="flex items-center gap-1 mb-4 text-yellow-400">
                ${'<i data-lucide="star" class="w-3 h-3 fill-current"></i>'.repeat(p.rating)}
                ${'<i data-lucide="star" class="w-3 h-3 text-slate-200"></i>'.repeat(5 - p.rating)}
                <span class="text-[9px] font-black text-slate-400 ml-1">(${p.reviews})</span>
            </div>
        </div>
        <div class="pt-4 border-t border-slate-50">
            <div class="flex items-end justify-between mb-4">
                <div>
                    <div class="text-xl font-black text-slate-900">KSh ${p.price.toLocaleString()}</div>
                    <div class="text-[10px] text-slate-400 line-through">KSh ${p.oldPrice.toLocaleString()}</div>
                </div>
                <div class="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">${p.discount}</div>
            </div>
            <a href="/${p.slug}" class="w-full bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all">
                View Deal
            </a>
        </div>
    </div>
    `;
}

console.log("🚀 Starting Kenya Deals SEO Engine Build...");

// 1. Build Homepage
let gridHtml = products.map(generateProductCard).join('\n');
let finalHomeHtml = homeTemplate.replace('{{PRODUCT_GRID}}', gridHtml);
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), finalHomeHtml);
console.log("✅ Generated Homepage (index.html)");

// 2. Build Individual Product Pages
products.forEach(p => {
    let html = productTemplate
        .replace(/{{PRODUCT_NAME}}/g, p.name)
        .replace(/{{PRODUCT_DESC}}/g, p.description)
        .replace(/{{PRODUCT_IMAGE}}/g, p.image)
        .replace(/{{PRODUCT_BADGE}}/g, p.badge)
        .replace(/{{PRODUCT_CATEGORY}}/g, p.category)
        .replace(/{{PRODUCT_REVIEWS}}/g, p.reviews)
        .replace(/{{PRODUCT_PRICE}}/g, p.price.toLocaleString())
        .replace(/{{PRODUCT_OLD_PRICE}}/g, p.oldPrice.toLocaleString())
        .replace(/{{PRODUCT_DISCOUNT}}/g, p.discount)
        .replace(/{{PRODUCT_STORE}}/g, p.store);

    // Create a folder for the slug so we have clean URLs (e.g., /samsung-galaxy-a55-price-kenya/)
    const productDir = path.join(DIST_DIR, p.slug);
    fs.mkdirSync(productDir, { recursive: true });
    
    fs.writeFileSync(path.join(productDir, 'index.html'), html);
    console.log(`✅ Generated: /${p.slug}`);
});

console.log(`🎉 Successfully built ${products.length} SEO-optimized product pages!`);
