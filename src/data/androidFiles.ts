import { AndroidCodeFile } from '../types';

export const ANDROID_FILES: AndroidCodeFile[] = [
  {
    name: 'AndroidManifest.xml',
    path: 'android/app/src/main/AndroidManifest.xml',
    language: 'xml',
    description: 'Déclaration des permissions CAMERA et du composant matériel camera.flash requis.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.torchapp">

    <!-- Permission caméra pour accéder au flash physique de l'appareil -->
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- Déclare le flash matériel comme requis pour filtrer sur Google Play -->
    <uses-feature
        android:name="android.hardware.camera.flash"
        android:required="true" />

    <!-- Caméra optique non obligatoire pour les fonctionnalités de torche -->
    <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.TorchApp">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>`
  },
  {
    name: 'MainActivity.kt',
    path: 'android/app/src/main/java/com/example/torchapp/MainActivity.kt',
    language: 'kotlin',
    description: 'Logique Kotlin native : CameraManager, setTorchMode(), TorchCallback et gestion de la permission CAMERA.',
    content: `package com.example.torchapp

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Bundle
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var cameraManager: CameraManager
    private var cameraId: String? = null
    private var isTorchOn: Boolean = false
    private var hasCameraFlash: Boolean = false

    private lateinit var btnTorch: ImageButton
    private lateinit var tvStatus: TextView

    // Gestion moderne de la permission CAMERA via ActivityResultContracts
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            toggleTorch()
        } else {
            Toast.makeText(
                this,
                "Permission CAMERA nécessaire pour contrôler le flash.",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    // Callback pour synchroniser l'état si la torche est changée depuis le volet système
    private val torchCallback = object : CameraManager.TorchCallback() {
        override fun onTorchModeChanged(camId: String, enabled: Boolean) {
            super.onTorchModeChanged(camId, enabled)
            if (camId == cameraId) {
                isTorchOn = enabled
                updateUI()
            }
        }

        override fun onTorchModeUnavailable(camId: String) {
            super.onTorchModeUnavailable(camId)
            if (camId == cameraId) {
                isTorchOn = false
                updateUI()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        btnTorch = findViewById(R.id.btnTorch)
        tvStatus = findViewById(R.id.tvStatus)

        // 1. Vérification matérielle du flash
        hasCameraFlash = packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH)
        if (!hasCameraFlash) {
            tvStatus.text = "Aucun flash matériel disponible"
            btnTorch.isEnabled = false
            Toast.makeText(this, "Cet appareil ne dispose pas d'un flash.", Toast.LENGTH_LONG).show()
            return
        }

        // 2. Initialisation du CameraManager
        cameraManager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
        initCameraWithFlash()

        // 3. Enregistrement du callback système
        cameraManager.registerTorchCallback(torchCallback, null)

        // 4. Écoute du clic sur l'unique bouton central
        btnTorch.setOnClickListener {
            checkPermissionAndToggleTorch()
        }

        updateUI()
    }

    private fun initCameraWithFlash() {
        try {
            for (id in cameraManager.cameraIdList) {
                val characteristics = cameraManager.getCameraCharacteristics(id)
                val hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) ?: false
                val facing = characteristics.get(CameraCharacteristics.LENS_FACING)

                // Privilégier la caméra arrière (back facing)
                if (hasFlash && facing == CameraCharacteristics.LENS_FACING_BACK) {
                    cameraId = id
                    break
                }
            }
            // Repli sur le premier flash disponible si pas de caméra arrière
            if (cameraId == null) {
                for (id in cameraManager.cameraIdList) {
                    val characteristics = cameraManager.getCameraCharacteristics(id)
                    val hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) ?: false
                    if (hasFlash) {
                        cameraId = id
                        break
                    }
                }
            }
        } catch (e: CameraAccessException) {
            e.printStackTrace()
            Toast.makeText(this, "Erreur d'accès à la caméra : \${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkPermissionAndToggleTorch() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED
        ) {
            toggleTorch()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun toggleTorch() {
        val targetCamId = cameraId
        if (targetCamId == null) {
            Toast.makeText(this, "Caméra avec flash indisponible.", Toast.LENGTH_SHORT).show()
            return
        }

        try {
            val newState = !isTorchOn
            cameraManager.setTorchMode(targetCamId, newState)
            isTorchOn = newState
            updateUI()
        } catch (e: CameraAccessException) {
            e.printStackTrace()
            Toast.makeText(this, "Erreur flash : \${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun updateUI() {
        if (isTorchOn) {
            btnTorch.setImageResource(R.drawable.ic_flashlight_on)
            tvStatus.text = "ALLUMÉ"
        } else {
            btnTorch.setImageResource(R.drawable.ic_flashlight_off)
            tvStatus.text = "ÉTEINT"
        }
    }

    override fun onStop() {
        super.onStop()
        // Éteindre le flash si l'app passe en arrière-plan pour économiser la batterie
        if (isTorchOn && cameraId != null) {
            try {
                cameraManager.setTorchMode(cameraId!!, false)
                isTorchOn = false
                updateUI()
            } catch (e: CameraAccessException) {
                e.printStackTrace()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraManager.unregisterTorchCallback(torchCallback)
    }
}`
  },
  {
    name: 'activity_main.xml',
    path: 'android/app/src/main/res/layout/activity_main.xml',
    language: 'xml',
    description: 'Mise en page Android avec un seul bouton centré au milieu de l\'écran.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#121212"
    tools:context=".MainActivity">

    <!-- Bouton central unique pour allumer / éteindre le flash -->
    <ImageButton
        android:id="@+id/btnTorch"
        android:layout_width="160dp"
        android:layout_height="160dp"
        android:background="@drawable/bg_torch_button"
        android:contentDescription="Interrupteur Lampe Torche"
        android:scaleType="centerInside"
        android:src="@drawable/ic_flashlight_off"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <TextView
        android:id="@+id/tvStatus"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="28dp"
        android:text="ÉTEINT"
        android:textColor="#E0E0E0"
        android:textSize="20sp"
        android:textStyle="bold"
        android:letterSpacing="0.1"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@+id/btnTorch" />

    <!-- Mention de bas de page -->
    <TextView
        android:id="@+id/tvCredits"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="24dp"
        android:gravity="center"
        android:text="Application créée par Isaac le boss\\nPour plus de contact : +243 898 835 803"
        android:textColor="#9E9E9E"
        android:textSize="13sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`
  },
  {
    name: 'build.gradle.kts',
    path: 'android/app/build.gradle.kts',
    language: 'kotlin',
    description: 'Configuration Gradle Android avec Kotlin et dépendances AndroidX.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.torchapp"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.torchapp"
        minSdk = 23
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
}`
  }
];
