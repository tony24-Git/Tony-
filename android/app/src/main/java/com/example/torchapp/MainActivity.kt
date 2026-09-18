package com.example.torchapp

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Build
import android.os.Bundle
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

/**
 * Activité principale gérant une lampe torche native Android
 * avec un seul bouton central pour allumer et éteindre le flash.
 */
class MainActivity : AppCompatActivity() {

    private lateinit var cameraManager: CameraManager
    private var cameraId: String? = null
    private var isTorchOn: Boolean = false
    private var hasCameraFlash: Boolean = false

    private lateinit var btnTorch: ImageButton
    private lateinit var tvStatus: TextView

    // Contrat moderne AndroidX pour la demande de permission d'exécution
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            toggleTorch()
        } else {
            Toast.makeText(
                this,
                "La permission caméra est nécessaire pour utiliser le flash.",
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    // Écouteur pour synchroniser l'état si le flash est modifié par le système
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

        // 1. Vérification de la présence matérielle du flash
        hasCameraFlash = packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH)
        if (!hasCameraFlash) {
            tvStatus.text = "Cet appareil ne dispose pas d'un flash matériel."
            btnTorch.isEnabled = false
            Toast.makeText(this, "Aucun flash détecté sur cet appareil.", Toast.LENGTH_LONG).show()
            return
        }

        // 2. Initialisation du CameraManager et détection de la caméra arrière avec flash
        cameraManager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
        initCameraWithFlash()

        // 3. Enregistrement du callback de statut de la torche
        cameraManager.registerTorchCallback(torchCallback, null)

        // 4. Clic sur le bouton central unique
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

                // On sélectionne de préférence la caméra arrière
                if (hasFlash && facing == CameraCharacteristics.LENS_FACING_BACK) {
                    cameraId = id
                    break
                }
            }

            // Si aucune caméra arrière avec flash n'est trouvée, prendre la première avec flash
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
            Toast.makeText(this, "Erreur d'accès à la caméra : ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Vérifie la permission CAMERA avant d'activer le flash.
     */
    private fun checkPermissionAndToggleTorch() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED
        ) {
            toggleTorch()
        } else {
            requestPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    /**
     * Bascule l'état du flash (allumé / éteint)
     */
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
            Toast.makeText(this, "Impossible de modifier l'état du flash : ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Met à jour le style du bouton et le texte descriptif
     */
    private fun updateUI() {
        if (isTorchOn) {
            btnTorch.setImageResource(R.drawable.ic_flashlight_on)
            btnTorch.isSelected = true
            tvStatus.text = "ALLUMÉ"
        } else {
            btnTorch.setImageResource(R.drawable.ic_flashlight_off)
            btnTorch.isSelected = false
            tvStatus.text = "ÉTEINT"
        }
    }

    override fun onStop() {
        super.onStop()
        // Éteindre le flash lorsque l'application passe en arrière-plan pour économiser la batterie
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
        // Désenregistrement du callback pour éviter toute fuite mémoire
        cameraManager.unregisterTorchCallback(torchCallback)
    }
}
