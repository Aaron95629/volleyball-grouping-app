import Foundation
import WidgetKit

@objc(WidgetBridge)
class WidgetBridge: NSObject {
    @objc static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc func reloadWidgets() {
        print("refresh triggered")
        WidgetCenter.shared.reloadAllTimelines()
    }
}
