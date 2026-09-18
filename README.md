# Lampe Torche Android & PWA

Application de lampe torche native Android (Kotlin) et Progressive Web App (PWA) conçue avec un bouton central unique, le contrôle matériel du flash de l'appareil photo et la gestion dynamique des permissions `CAMERA` / `FLASH`.

> **Application créée par Isaac le boss**  
> Contact : +243 898 835 803

---

## 📱 Fonctionnalités

- **Bouton unique au centre** : Allume et éteint instantanément le flash du smartphone.
- **Gestion des permissions Android** : Demande d'exécution moderne avec `ActivityResultContracts.RequestPermission()`.
- **API Matérielle Camera2** : `CameraManager.setTorchMode()` pour piloter la LED physique.
- **PWA & Web Torch** : Installable en 1 clic sur Android (Chrome) ou iPhone (Safari).
- **Projet Android Natif complet** : Tous les fichiers sources Android Studio inclus dans le dossier `android/`.

---

## 📁 Structure du projet

```
.
├── android/
│   └── app/
│       ├── build.gradle.kts
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── java/com/example/torchapp/MainActivity.kt
│           └── res/layout/activity_main.xml
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── TorchButton.tsx
│   │   ├── AndroidCodeModal.tsx
│   │   └── ApkDownloadModal.tsx
│   └── utils/
│       └── torchController.ts
├── public/
├── package.json
└── README.md
```

---

## 🚀 Générer le fichier APK avec Android Studio

1. Ouvrez le dossier `android/` dans **Android Studio**.
2. Laissez Gradle synchroniser les dépendances.
3. Cliquez sur **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. Récupérez le fichier APK généré dans :
   `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## 💻 Exécuter l'application Web / PWA en local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

---

## 👤 Auteur

- **Isaac le boss**
- **Téléphone / WhatsApp** : +243 898 835 803
