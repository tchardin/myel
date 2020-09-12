//
//  LineView.swift
//  Myel
//
//  Created by Thomas Chardin on 9/3/20.
//  Copyright © 2020 Myel. All rights reserved.
//
// https://github.com/AppPear/ChartView/blob/master/Sources/SwiftUICharts/LineChart/Line.swift

import SwiftUI

struct Line: View {
    var data: [Double]
    @Binding var frame: CGRect
    @State private var showFull: Bool = false
    let padding: CGFloat = 30
    var stepWidth: CGFloat {
        return frame.size.width / CGFloat(data.count - 1)
    }
    var stepHeight: CGFloat {
        let min = data.min()
        let max = data.max()
        return (frame.size.height-padding) / CGFloat(max! - min!)
    }
    var body: some View {
        ZStack {
            if self.showFull {
                Path { path in
                    let offset = self.data.min()!
                    let step = CGPoint(x: stepWidth, y: stepHeight)
                    path.move(to: .zero)
                    var p1 = CGPoint(x: 0, y: CGFloat(self.data[0]-offset)*step.y)
                    path.addLine(to: p1)
                    for pointIndex in 1..<self.data.count {
                        let p2 = CGPoint(x: step.x * CGFloat(pointIndex), y: step.y*CGFloat(self.data[pointIndex]-offset))
                        let midPoint = CGPoint.midPointForPoints(p1: p1, p2: p2)
                        path.addQuadCurve(to: midPoint, control: CGPoint.controlPointForPoints(p1: midPoint, p2: p1))
                        path.addQuadCurve(to: p2, control: CGPoint.controlPointForPoints(p1: midPoint, p2: p2))
                        p1 = p2
                    }
                    path.addLine(to: CGPoint(x: p1.x, y: 0))
                    path.closeSubpath()
                }
                .fill(LinearGradient(gradient: Gradient(colors: [Color.green, Color.green.opacity(0.1)]), startPoint: .bottom, endPoint: .top))
                .rotationEffect(.degrees(180), anchor: .center)
                .rotation3DEffect(.degrees(180), axis: (x:0, y:1, z:0))
                .transition(.opacity)
                .animation(.easeIn(duration: 1.6))
            }
            Path { path in
                let offset = self.data.min()!
                let step = CGPoint(x: stepWidth, y: stepHeight)
                var p1 = CGPoint(x: 0, y: CGFloat(self.data[0]-offset)*step.y)
                path.move(to: p1)
                for pointIndex in 1..<self.data.count {
                    let p2 = CGPoint(x: step.x * CGFloat(pointIndex), y: step.y*CGFloat(self.data[pointIndex]-offset))
                    let midPoint = CGPoint.midPointForPoints(p1: p1, p2: p2)
                    path.addQuadCurve(to: midPoint, control: CGPoint.controlPointForPoints(p1: midPoint, p2: p1))
                    path.addQuadCurve(to: p2, control: CGPoint.controlPointForPoints(p1: midPoint, p2: p2))
                    p1 = p2
                }
            }
            .trim(from: 0, to: self.showFull ? 1 : 0)
            .stroke(Color.green, style: StrokeStyle(lineWidth: 3, lineJoin: .round))
            .rotationEffect(.degrees(180), anchor: .center)
            .rotation3DEffect(.degrees(180), axis: (x: 0, y: 1, z: 0))
            .animation(Animation.easeOut(duration: 1.2))
            .onAppear{
                self.showFull = true
            }
            .onDisappear {
                self.showFull = false
            }
            .drawingGroup()
        }
    }
}

struct LineView: View {
    var data: [Double]
    
    var body: some View {
        VStack(alignment: .leading) {
            ZStack {
                GeometryReader{ geometry in
                    Line(data: self.data, frame: .constant(geometry.frame(in: .local)))
                }
            }
        }
    }
}

extension CGPoint {
    static func midPointForPoints(p1:CGPoint, p2:CGPoint) -> CGPoint {
        return CGPoint(x:(p1.x + p2.x) / 2,y: (p1.y + p2.y) / 2)
    }
    static func controlPointForPoints(p1:CGPoint, p2:CGPoint) -> CGPoint {
        var controlPoint = CGPoint.midPointForPoints(p1:p1, p2:p2)
        let diffY = abs(p2.y - controlPoint.y)
        
        if (p1.y < p2.y){
            controlPoint.y += diffY
        } else if (p1.y > p2.y) {
            controlPoint.y -= diffY
        }
        return controlPoint
    }
}

struct LineView_Previews: PreviewProvider {
    static var previews: some View {
        LineView(data: [434.6396813295063, 435.8195747707865, 436.44631179960146, 436.0803065602451, 435.07288229753533, 435.39366090407395, 435.4958600118384, 435.7777503814384, 436.02390216120955, 436.93242592598335, 437.67717705247793])
    }
}
