package com.bros.volleyballproject

import android.os.Bundle
import android.view.KeyEvent
import com.facebook.react.ReactActivity
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactRootView
import com.facebook.react.PackageList
import com.facebook.react.common.LifecycleState
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler

class MyReactActivity : ReactActivity(), DefaultHardwareBackBtnHandler {

    private lateinit var reactRootView: ReactRootView
    private lateinit var reactInstanceManager: ReactInstanceManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize SoLoader for React Native
        SoLoader.init(this, /* native exopackage */ false)

        // Create ReactRootView
        reactRootView = ReactRootView(this)

        // Get the list of React packages
        val packages: List<ReactPackage> = PackageList(application).packages

        // Create ReactInstanceManager to manage the JavaScript environment
        reactInstanceManager = ReactInstanceManager.builder()
            .setApplication(application)
            .setCurrentActivity(this)
            .setBundleAssetName("index.android.bundle") // Path to the bundle
            .setJSMainModulePath("index") // Path to the JS entry file
            .addPackages(packages)
            .setUseDeveloperSupport(BuildConfig.DEBUG)
            .setInitialLifecycleState(LifecycleState.RESUMED)
            .build()

        // Start the React Native app with the ReactRootView
        reactRootView.startReactApplication(reactInstanceManager, "MyReactNativeApp", null)

        // Set the ReactRootView as the content view of this activity
        setContentView(reactRootView)
    }

    override fun invokeDefaultOnBackPressed() {
        super.onBackPressed()
    }

    override fun onPause() {
        super.onPause()
        reactInstanceManager.onHostPause(this)
    }

    override fun onResume() {
        super.onResume()
        reactInstanceManager.onHostResume(this, this)
    }

    override fun onDestroy() {
        super.onDestroy()
        reactInstanceManager.onHostDestroy(this)
        reactRootView.unmountReactApplication()
    }

    override fun onBackPressed() {
        if (this::reactInstanceManager.isInitialized && reactInstanceManager.hasStartedCreatingInitialContext()) {
            reactInstanceManager.onBackPressed()
        } else {
            super.onBackPressed()
        }
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_MENU && this::reactInstanceManager.isInitialized) {
            reactInstanceManager.showDevOptionsDialog()
            return true
        }
        return super.onKeyUp(keyCode, event)
    }
}
