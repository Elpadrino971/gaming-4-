# 📱 Guide Capacitor - BingoShop Mobile App

## 🎯 Vue d'ensemble

BingoShop est maintenant configuré avec **Capacitor** pour créer de vraies applications natives iOS et Android à partir du code Next.js existant.

---

## ✨ Ce Qui a Été Ajouté

### 1. 🚀 Capacitor Configuration
- ✅ `capacitor.config.ts` - Configuration native
- ✅ Scripts npm pour iOS et Android
- ✅ Plugins natifs installés:
  - Push Notifications
  - Haptics (vibrations)
  - Status Bar
  - Splash Screen

### 2. 📱 Mobile UX Improvements
- ✅ **Bottom Navigation Bar** - Navigation style iOS/Android
- ✅ **Dark Mode** - Support système + toggle manuel
- ✅ **Framer Motion** - Animations fluides
- ✅ **Touch Optimizations** - Boutons 44x44px minimum
- ✅ **Safe Area** - Support notches iPhone/Android

### 3. 🎓 Onboarding Tutorial
- ✅ Guide interactif pour nouveaux users
- ✅ 6 étapes expliquant toutes les features
- ✅ Désactivable avec localStorage

### 4. 🎨 PWA Ready
- ✅ `manifest.json` - Web app manifest
- ✅ Icons configuration
- ✅ Splash screens ready

---

## 🛠️ Installation & Setup

### Prérequis

**Pour iOS:**
- macOS requis
- Xcode 14+ installé
- CocoaPods installé: `sudo gem install cocoapods`

**Pour Android:**
- Android Studio installé
- Java JDK 17+
- Android SDK configuré

### 1. Initialiser Capacitor

```bash
cd frontend
npm run cap:init
```

Cette commande va demander:
- **App name:** BingoShop
- **App ID:** com.bingoshop.app
- **Web directory:** out

### 2. Ajouter les Plateformes

**iOS:**
```bash
npm run cap:add:ios
```

**Android:**
```bash
npm run cap:add:android
```

Cela va:
1. Build Next.js en mode static export (`out/` directory)
2. Créer le projet natif iOS/Android
3. Copier le build web dans le projet natif

---

## 📱 Développement

### Build & Sync

À chaque modification du code frontend:

```bash
npm run cap:sync
```

Cela va:
1. Rebuild Next.js
2. Copier dans les projets natifs
3. Synchroniser les plugins

### Ouvrir dans les IDEs Natifs

**iOS (Xcode):**
```bash
npm run cap:open:ios
```

**Android (Android Studio):**
```bash
npm run cap:open:android
```

### Lancer sur Simulateur/Émulateur

**iOS:**
```bash
npm run cap:run:ios
```

**Android:**
```bash
npm run cap:run:android
```

---

## 🔧 Configuration Native

### iOS (Xcode)

1. **Ouvrir le projet:**
   ```bash
   cd ios/App
   open App.xcworkspace
   ```

2. **Configurer:**
   - **General Tab:**
     - Bundle Identifier: `com.bingoshop.app`
     - Version: 1.0.0
     - Build: 1
     - Deployment Target: iOS 13.0+

   - **Signing & Capabilities:**
     - Team: Votre Apple Developer Team
     - Provisioning Profile: Automatic

   - **Info.plist Permissions:**
     ```xml
     <key>NSUserNotificationsUsageDescription</key>
     <string>Recevoir des notifications pour les événements</string>
     ```

3. **Icons & Launch Screen:**
   - Assets.xcassets → AppIcon
   - Drag & drop les icons générés

### Android (Android Studio)

1. **Ouvrir le projet:**
   ```bash
   cd android
   ```
   - File → Open → Sélectionner `/frontend/android`

2. **Configurer `android/app/build.gradle`:**
   ```gradle
   android {
       compileSdkVersion 34
       defaultConfig {
           applicationId "com.bingoshop.app"
           minSdkVersion 22
           targetSdkVersion 34
           versionCode 1
           versionName "1.0.0"
       }
   }
   ```

3. **Permissions (`AndroidManifest.xml`):**
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.VIBRATE" />
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```

4. **Icons:**
   - Générer avec Android Studio:
     - Clic droit sur `res` → New → Image Asset
     - Source: icon-512.png

---

## 🎨 Assets (Icons & Splash Screens)

### Générer les Icons

Vous devez créer des icons aux tailles suivantes:

| Taille | Usage |
|--------|-------|
| 72x72 | Android |
| 96x96 | Android |
| 128x128 | Android |
| 144x144 | Android |
| 152x152 | iOS |
| 192x192 | Android/PWA |
| 384x384 | Android |
| 512x512 | Android/PWA |
| 1024x1024 | iOS App Store |

**Outil recommandé:** [https://icon.kitchen/](https://icon.kitchen/)

1. Upload votre logo
2. Télécharger tous les formats
3. Placer dans `/frontend/public/`

### Splash Screens iOS

Créer dans Xcode:
- Launch Screen Storyboard
- Background color: `#6366f1`
- Center logo

### Splash Screen Android

Générer avec Android Studio:
- Clic droit sur `res` → New → Image Asset → Launch Icon
- Background color: `#6366f1`

---

## 🔌 Utiliser les Plugins Natifs

### 1. Push Notifications

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Register
await PushNotifications.requestPermissions();
await PushNotifications.register();

// Listen
PushNotifications.addListener('registration', (token) => {
  console.log('Push token:', token.value);
});

PushNotifications.addListener('pushNotificationReceived', (notification) => {
  console.log('Push received:', notification);
});
```

### 2. Haptics (Vibrations)

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Light tap
await Haptics.impact({ style: ImpactStyle.Light });

// Medium tap
await Haptics.impact({ style: ImpactStyle.Medium });

// Heavy tap
await Haptics.impact({ style: ImpactStyle.Heavy });
```

### 3. Status Bar

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// Dark text (light background)
await StatusBar.setStyle({ style: Style.Light });

// Light text (dark background)
await StatusBar.setStyle({ style: Style.Dark });

// Set background color
await StatusBar.setBackgroundColor({ color: '#6366f1' });
```

### 4. Splash Screen

```typescript
import { SplashScreen } from '@capacitor/splash-screen';

// Show
await SplashScreen.show();

// Hide
await SplashScreen.hide();
```

---

## 🚀 Publication

### iOS App Store

1. **Préparer:**
   ```bash
   cd ios/App
   ```
   - Product → Archive
   - Window → Organizer
   - Sélectionner l'archive → Distribute App

2. **App Store Connect:**
   - Créer app sur [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Upload via Xcode
   - Remplir metadata
   - Screenshots (6.5" iPhone, 12.9" iPad)
   - Soumettre pour review

3. **Review:**
   - Temps: 1-3 jours
   - Répondre aux questions
   - App live une fois approuvée

### Google Play Store

1. **Build Release APK:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Signer l'APK:**
   ```bash
   # Générer keystore
   keytool -genkey -v -keystore bingoshop.keystore -alias bingoshop -keyalg RSA -keysize 2048 -validity 10000

   # Signer
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore bingoshop.keystore app/build/outputs/bundle/release/app-release.aab bingoshop
   ```

3. **Upload:**
   - [play.google.com/console](https://play.google.com/console)
   - Créer app
   - Upload AAB
   - Remplir listing
   - Screenshots (Phone, Tablet)
   - Lancer review

4. **Review:**
   - Temps: 1-7 jours
   - App live une fois approuvée

---

## 📊 Monitoring & Analytics

### Crash Reporting

**Sentry:**
```bash
npm install @sentry/capacitor @sentry/react
```

```typescript
import * as Sentry from '@sentry/capacitor';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

### Analytics

**Firebase Analytics:**
```bash
npm install @capacitor-firebase/analytics
```

```typescript
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

await FirebaseAnalytics.logEvent({
  name: 'game_started',
  params: { game_type: 'STANDARD' },
});
```

---

## 🐛 Debugging

### Web Dev Mode

Pendant le développement, vous pouvez tester dans le navigateur:

```bash
npm run dev
```

L'app fonctionne normalement, les plugins natifs sont simulés.

### iOS Safari Inspector

1. iPhone connecté → Safari
2. Develop → iPhone → BingoShop

### Android Chrome DevTools

1. Android connecté → Chrome
2. `chrome://inspect`
3. Sélectionner BingoShop

### Logs Natifs

**iOS:**
```bash
npx cap run ios --livereload
```

**Android:**
```bash
npx cap run android --livereload
```

---

## 🎯 Checklist Avant Publication

### Technique
- [ ] Icons générés (toutes tailles)
- [ ] Splash screens configurés
- [ ] Permissions ajoutées
- [ ] Build en Release mode teste
- [ ] Crash reporting configuré
- [ ] Analytics intégré
- [ ] Deep links configurés

### App Store Metadata
- [ ] Nom app (30 chars max)
- [ ] Description courte (80 chars)
- [ ] Description longue (4000 chars)
- [ ] Screenshots (6 minimum)
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Age Rating
- [ ] Categories

### Tests
- [ ] Installation fresh
- [ ] Onboarding flow
- [ ] Push notifications
- [ ] Offline mode
- [ ] Paiements Stripe
- [ ] Socket.io jeux
- [ ] Dark mode
- [ ] Rotation écran

---

## 📚 Ressources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://material.io/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

---

## 💡 Tips & Best Practices

### Performance
- ✅ Lazy load images
- ✅ Code splitting avec Next.js
- ✅ Minimiser bundle size
- ✅ Use `next/image` pour optimisation

### UX Mobile
- ✅ Tous boutons ≥44x44px
- ✅ Loading states partout
- ✅ Offline fallbacks
- ✅ Error boundaries
- ✅ Pull-to-refresh

### Sécurité
- ✅ HTTPS only
- ✅ Validate inputs
- ✅ Secure storage (Keychain/Keystore)
- ✅ Certificate pinning

---

## 🆘 Troubleshooting

### Build Failed

**Erreur: "Command failed: npm run build"**
```bash
# Clear cache
rm -rf .next out node_modules
npm install
npm run build:mobile
```

### iOS Pod Install Failed
```bash
cd ios/App
pod deintegrate
pod install
```

### Android Gradle Sync Failed
```bash
cd android
./gradlew clean
./gradlew build
```

### Plugins Not Working
```bash
npm run cap:sync
# Rebuild in Xcode/Android Studio
```

---

## 🎉 Félicitations!

Vous avez maintenant une app mobile iOS + Android complète avec:
- ✅ Navigation native
- ✅ Dark mode
- ✅ Push notifications ready
- ✅ Haptic feedback
- ✅ Onboarding tutorial
- ✅ PWA compatible
- ✅ App stores ready

**BingoShop is ready to ship! 🚀**

---

*Guide créé avec ❤️ - Décembre 2025*
