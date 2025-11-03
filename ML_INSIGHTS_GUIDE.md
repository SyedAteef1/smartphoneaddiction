# ML Insights & Analytics - Complete Guide

## 🎯 What It Does

The ML Insights Dashboard provides:
- **Addiction Risk Prediction** based on real app usage
- **Top Apps Analysis** with pie chart visualization
- **Usage Breakdown** with bar chart comparison
- **AI-Generated Insights** from your usage patterns
- **Personalized Recommendations** to improve habits

## 📊 Features

### 1. Risk Assessment
- Analyzes your screen time vs daily limit
- Calculates risk level: Low → Moderate → High → Critical
- Color-coded visual indicator
- Real-time updates

### 2. Visual Analytics
- **Pie Chart**: Shows distribution of top 5 apps
- **Bar Chart**: Compares usage time across apps
- **Interactive**: Tap to see details

### 3. AI Insights
- Identifies most used app
- Tracks usage percentage
- Detects app diversity patterns
- Provides context-aware messages

### 4. Smart Recommendations
- Risk-based suggestions
- Actionable steps
- Personalized advice

## 🚀 How to Use

### Step 1: Install Dependencies
```bash
cd d:\work\StickerSmash
npm install
```

### Step 2: Rebuild App
```bash
npx expo run:android
```

### Step 3: Access ML Insights
1. Open app
2. Scroll down on dashboard
3. Tap **"ML Insights & Analytics"** button
4. View comprehensive analysis

## 📱 What You'll See

### Dashboard Button
```
┌──────────────────────────────────────┐
│  📊 ML Insights & Analytics  →       │
│     (Purple gradient button)         │
└──────────────────────────────────────┘
```

### ML Insights Screen

#### 1. Risk Assessment Card
```
🛡️ ADDICTION RISK
   HIGH RISK
   180 / 120 minutes used
```

#### 2. Top Apps Pie Chart
```
📊 Top Apps Distribution
   [Colorful pie chart showing app usage %]
   - Instagram: 35%
   - YouTube: 25%
   - WhatsApp: 20%
   - Chrome: 15%
   - Others: 5%
```

#### 3. Usage Bar Chart
```
📈 App Usage Breakdown
   [Bar chart comparing app times]
   Instagram: 63m
   YouTube: 45m
   WhatsApp: 36m
   Chrome: 27m
   Games: 9m
```

#### 4. AI Insights
```
💡 AI Insights
   ✓ Instagram is your most used app (63min)
   ✓ You're at 150% of your daily limit
   ✓ You've used 12 different apps today
```

#### 5. Recommendations
```
⭐ Recommendations
   • Set app timers for top 3 apps
   • Take a 15-minute break now
   • Try alternative activities
```

## 🤖 How ML Works

### Data Collection
```
Real App Usage (from Android)
    ↓
Extract Features:
- Total time per app
- Number of apps used
- Usage percentage
- Time distribution
    ↓
ML Analysis
```

### Risk Calculation
```python
if usage > 100% of limit:
    risk = CRITICAL (3)
elif usage > 80%:
    risk = HIGH (2)
elif usage > 50%:
    risk = MODERATE (1)
else:
    risk = LOW (0)
```

### Insights Generation
```
1. Find most used app
2. Calculate usage percentage
3. Count app diversity
4. Generate contextual messages
5. Provide recommendations
```

## 📊 Data Flow

```
User Uses Phone
    ↓
Android Tracks Usage
    ↓
App Fetches Data (every 10s)
    ↓
ML Dashboard Analyzes
    ↓
┌─────────────────────────┐
│ Risk Assessment         │
│ Visual Charts           │
│ AI Insights             │
│ Recommendations         │
└─────────────────────────┘
    ↓
Display to User
```

## 🎨 Customization

### Change Risk Thresholds
Edit `MLInsightsDashboard.tsx`:
```typescript
const percentage = (totalTime / dailyLimit) * 100;
let risk = 0;
if (percentage > 100) risk = 3;      // Change these
else if (percentage > 80) risk = 2;  // values to
else if (percentage > 50) risk = 1;  // customize
```

### Add More Insights
```typescript
if (apps.length > 15) {
  newInsights.push('High app diversity detected');
}
```

### Modify Chart Colors
```typescript
const pieData = topApps.map((app, index) => ({
  color: ['#667eea', '#764ba2', '#f093fb'][index], // Add more colors
}));
```

## 🔧 Technical Details

### Components Used
- `react-native-chart-kit` - Charts
- `useAppUsage` hook - Real usage data
- `LinearGradient` - Beautiful UI
- `Ionicons` - Icons

### Charts
1. **PieChart** - App distribution
2. **BarChart** - Usage comparison
3. **LineChart** - (Future: trend over days)

### Data Sources
- Real Android usage stats
- Live updates every 10 seconds
- Accurate app names and times

## 💡 Example Scenarios

### Scenario 1: Light User
```
Risk: LOW (Green)
Usage: 45 / 120 minutes
Insights:
- "You're at 38% of your daily limit"
- "Great job maintaining healthy habits"
Recommendations:
- "Keep up the good work"
```

### Scenario 2: Heavy User
```
Risk: HIGH (Orange)
Usage: 180 / 120 minutes
Insights:
- "Instagram is your most used app (90min)"
- "You've exceeded your limit by 60 minutes"
Recommendations:
- "Set app timers for top 3 apps"
- "Take a 15-minute break now"
```

### Scenario 3: Critical User
```
Risk: CRITICAL (Red)
Usage: 240 / 120 minutes
Insights:
- "You're at 200% of your daily limit"
- "High app diversity detected (15 apps)"
Recommendations:
- "Set strict daily usage limits"
- "Use app blocking during peak hours"
- "Schedule digital detox periods"
```

## 🎯 Benefits

### For Users
- ✅ Visual understanding of usage
- ✅ Real-time risk assessment
- ✅ Actionable recommendations
- ✅ Beautiful, intuitive interface

### For Parents
- ✅ Monitor child's app usage
- ✅ See which apps are problematic
- ✅ Get alerts for high risk
- ✅ Track improvement over time

## 🚀 Future Enhancements

1. **7-Day Trend Chart** - See usage over week
2. **App Category Analysis** - Social vs Productivity
3. **Time-of-Day Heatmap** - When you use phone most
4. **Comparison with Peers** - Anonymous benchmarking
5. **Export Reports** - PDF/CSV export
6. **Predictive Alerts** - "You're likely to exceed limit today"

## 📝 Troubleshooting

### Charts Not Showing
- Ensure `react-native-chart-kit` is installed
- Check if `apps` array has data
- Verify screen width calculation

### No Insights
- Use phone for a while to generate data
- Check if usage permission is granted
- Verify `useAppUsage` hook is working

### Risk Always Low
- Check if `totalTime` is updating
- Verify `dailyLimit` is set correctly
- Ensure real data is being fetched

## 📚 Summary

The ML Insights Dashboard:
- Uses **real app usage data** from Android
- Provides **visual analytics** with charts
- Calculates **addiction risk** automatically
- Generates **AI insights** from patterns
- Offers **personalized recommendations**

**All in one beautiful, easy-to-use interface!** 🎉

---

**Ready to use! Just rebuild and tap the ML Insights button on dashboard.**
