import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import BackgroundTasks
import TSBackgroundFetch
import HealthKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  let healthStore = HKHealthStore()

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "WellCare",
      in: window,
      launchOptions: launchOptions
    )

    TSBackgroundFetch.sharedInstance().didFinishLaunching()
    enableHealthKitBackgroundDelivery()

    return true
  }

  func enableHealthKitBackgroundDelivery() {
    guard HKHealthStore.isHealthDataAvailable() else { return }

    let types: Set<HKObjectType> = [
      HKObjectType.quantityType(forIdentifier: .stepCount)!,
      HKObjectType.quantityType(forIdentifier: .heartRate)!,
      HKObjectType.quantityType(forIdentifier: .oxygenSaturation)!,
      HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
    ]

    healthStore.requestAuthorization(toShare: nil, read: types) { success, error in
      guard success else {
        print("[HealthKit] Authorization failed:", error?.localizedDescription ?? "unknown")
        return
      }

      for type in types {
        self.healthStore.enableBackgroundDelivery(for: type, frequency: .immediate) { success, error in
          if success {
            print("[HealthKit] Background delivery enabled for \(type.identifier)")
          } else {
            print("[HealthKit] Background delivery FAILED for \(type.identifier):", error?.localizedDescription ?? "unknown")
          }
        }
      }
    }
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}