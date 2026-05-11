# Bir Sonraki AI Asistanı İçin Prompt (NEXT_AGENT_PROMPT)

Eğer yeni bir konuşma başlatacak veya konuyu asistanla devam ettirecekseniz, aşağıdaki promptu kopyalayıp asistana gönderebilirsiniz:

---

**Asistanın Dikkatine:**

Ben teknik bilgisi sınırlı bir kullanıcıyım. Bu projeyi yeni bilgisayarıma taşıdım ve bir önceki turda `PROJECT_DEEP_ANALYSIS.md`, `LOCAL_SETUP_RUNBOOK.md` ve `COMPLETION_ROADMAP.md` belgelerini çıkarttık.

Şimdi seninle birlikte **COMPLETION_ROADMAP** içindeki **Batch 0** ve **Batch 1** aşamalarını güvenli bir şekilde adım adım uygulamak istiyorum.

**Lütfen aşağıdaki kurallara göre hareket et:**
1. Hızlıca kod yazmaya veya dosya değiştirmeye çalışma. Önce ortamımı kontrol edeceğiz.
2. `LOCAL_SETUP_RUNBOOK.md` belgesini oku ve oradaki adımları bana uygulatmaya / terminali kullanarak doğrulamaya başla.
3. Öncelikle `node -v` ve `docker-compose version` gibi komutlarla benim sistemimin hazır olup olmadığını tespit et (Bunun için terminal komut çalıştırma yetkini kullanabilirsin, ancak bana komutların ne yaptığını açıkla ve benden onay bekle).
4. `.env` dosyalarını otomatik olarak kopyala ve içlerindeki değerleri standart `localhost` ayarlarında yapılandır.
5. `docker-compose up -d` komutunu çalıştırarak veritabanının ayağa kalktığından emin ol.
6. Frontend ve Backend için `npm install` süreçlerini başlat ve olası hataları çöz.
7. Eğer her şey yolundaysa backend ve frontend'i ayağa kaldırıp, benim tarayıcıdan test edebilmem için net bir link ver.

*NOT: Her komuttan önce ne yapacağını kısa ve net bir dille Türkçe olarak açıkla. İşlemleri tek bir seferde yapıp sistemi boğma; adım adım ilerle.*

Hadi Batch 0'dan, yani ortamın doğrulanmasından başlayalım. İlk adımın nedir?
