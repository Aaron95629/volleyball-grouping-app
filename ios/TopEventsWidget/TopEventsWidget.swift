import WidgetKit
import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Event Model
struct TopEvent: Codable, Identifiable {
    let id: Int
    let name: String
    let location: String
    let date: String
    let start_time: String
    let end_time: String
    let spots_left: Int?
}

// MARK: - Timeline Entry
struct EventsEntry: TimelineEntry {
    let date: Date
    let events: [TopEvent]
}

// Helper extension for date parsing
extension String {
    func toDate() -> Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        return formatter.date(from: self)
    }
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> EventsEntry {
        EventsEntry(date: Date(), events: [])
    }

    func getSnapshot(in context: Context, completion: @escaping (EventsEntry) -> Void) {
        let entry = EventsEntry(date: Date(), events: [])
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<EventsEntry>) -> Void) {
        print("Fetching timeline from API")
        
        let apiBaseURL = "https://volleyball-app-aefac3e08718.herokuapp.com"
        guard let url = URL(string: "\(apiBaseURL)/events/active/") else {
            print("Invalid API URL")
            let entry = EventsEntry(date: Date(), events: [])
            let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
            completion(timeline)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("API request error: \(error)")
                let entry = EventsEntry(date: Date(), events: [])
                let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
                completion(timeline)
                return
            }

            guard let data = data else {
                print("No data received from API")
                let entry = EventsEntry(date: Date(), events: [])
                let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
                completion(timeline)
                return
            }

            do {
                if let rawString = String(data: data, encoding: .utf8) {
                    print("Raw API response: \(rawString)")
                } else {
                    print("Unable to convert API response to string")
                }

                let jsonObject = try JSONSerialization.jsonObject(with: data)
                print("Parsed JSON object: \(jsonObject)")

                guard let activeEvents = jsonObject as? [[String: Any]] else {
                    print("Invalid API response format: Expected array of dictionaries")
                    let entry = EventsEntry(date: Date(), events: [])
                    let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
                    completion(timeline)
                    return
                }

                let sortedEvents = activeEvents.sorted { (event1, event2) -> Bool in
                    guard let date1 = event1["date"] as? String,
                          let date2 = event2["date"] as? String,
                          let dateObj1 = date1.toDate(),
                          let dateObj2 = date2.toDate() else {
                        return false
                    }
                    return dateObj1 < dateObj2
                }
                let topEvents = Array(sortedEvents.prefix(3))
                print("Top 3 events: \(topEvents)")

                let jsonData = try JSONSerialization.data(withJSONObject: topEvents)
                let decoder = JSONDecoder()
                let events = try decoder.decode([TopEvent].self, from: jsonData)
                print("Decoded events: \(events)")

                let entry = EventsEntry(date: Date(), events: events)
                let refreshDate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
                let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
                completion(timeline)
            } catch {
                print("Error parsing or decoding API response: \(error)")
                let entry = EventsEntry(date: Date(), events: [])
                let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
                completion(timeline)
            }
        }
        task.resume()
    }
}

// MARK: - Widget View
struct TopEventsWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var widgetFamily
    
    var body: some View {
        ZStack {
            Color(hex: "FFFFFF")
                .ignoresSafeArea(.all)
                .edgesIgnoringSafeArea(.all)
            
            if entry.events.isEmpty {
                Text("尚無可顯示的活動")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(Color(hex: "555"))
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .offset(x: 0, y: 0)
            } else {
                switch widgetFamily {
                case .systemSmall:
                    EventView(event: entry.events.first, isCompact: true)
                        .frame(alignment: .topLeading)
                        .offset(x: 5, y: 10)
                case .systemMedium:
                    VStack(spacing: 8) {
                        ForEach(entry.events.prefix(2)) { event in
                            EventView(event: event, isCompact: true)
                                .frame(alignment: .topLeading)
                        }
                        Spacer()
                    }
                    .frame(alignment: .topLeading)
                    .offset(x: 5, y: 10)
                case .systemLarge:
                    VStack(spacing: 0) {
                        ForEach(entry.events.prefix(3)) { event in
                            EventView(event: event, isCompact: false)
                            Rectangle()
                                .fill(Color(hex: "ddd"))
                                .frame(height: 1)
                        }
                        Spacer()
                    }
                    .frame(alignment: .topLeading)
                    .offset(x: 5, y: 10)
                @unknown default:
                    EventView(event: entry.events.first, isCompact: true)
                        .frame(alignment: .topLeading)
                        .offset(x: 5, y: 10)
                }
            }
        }
        .widgetBackground(Color(hex: "FFFFFF"))
        .preferredColorScheme(.light)
    }
    
    private func EventView(event: TopEvent?, isCompact: Bool) -> some View {
        HStack(alignment: .top, spacing: 0) {
            VStack(alignment: .leading, spacing: 2) {
                if let event = event {
                    Text(event.name)
                        .font(.system(size: 19, weight: .bold))
                        .foregroundColor(Color(hex: "333"))
                        .lineLimit(2)
                    
                    HStack(spacing: 2) {
                        Text("沙灘排球")
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                            .padding(.horizontal, 2)
                            .padding(.vertical, 2)
                            .background(Color(hex: "ff7f50"))
                            .clipShape(RoundedRectangle(cornerRadius: 5))
                        
                        Text("開放報名")
                            .font(.system(size: 14))
                            .foregroundColor(.white)
                            .padding(.horizontal, 2)
                            .padding(.vertical, 2)
                            .background(Color(hex: "50c878"))
                            .clipShape(RoundedRectangle(cornerRadius: 5))
                    }
                    
                    Text("\(event.date) \(event.start_time)")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "555"))
                    
                    if !isCompact {
                        Text("新北市 \(event.location)")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "555"))
                            .lineLimit(2)
                    }
                } else {
                    Text("無活動")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(Color(hex: "555"))
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            if let event = event {
                HStack(spacing: 5) {
                    Text(event.spots_left.map { String($0) } ?? "N/A")
                        .font(.system(size: 25, weight: .bold))
                        .foregroundColor(.white)
                        .frame(width: 35, height: 45)
                        .background(Color(hex: "50c878"))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    
                    Text("人")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "555"))
                }
            }
        }
        .frame(alignment: .topLeading)
        .offset(x: 0, y: 0)
    }
}

extension View {
    func widgetBackground(_ background: Color) -> some View {
        if #available(iOSApplicationExtension 17.0, *) {
            return containerBackground(background, for: .widget)
        } else {
            return self.background(background)
        }
    }
}

// MARK: - Widget Definition

struct TopEventsWidget: Widget {
    let kind: String = "TopEventsWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            ZStack {
                Color(hex: "FFFFFF")
                    .ignoresSafeArea(.all)
                    .background(.white)
                TopEventsWidgetEntryView(entry: entry)
            }
            .containerBackground(.white, for: .widget)
        }
        .configurationDisplayName("Top Events")
        .description("Displays upcoming volleyball events.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
