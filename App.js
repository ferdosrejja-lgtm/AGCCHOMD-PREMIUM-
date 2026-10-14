import React, { useState } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DEFAULT_API_URL = 'http://YOUR_COMPUTER_IP:3000';

const modes = [
  { id: 'ask', label: 'Ask anything', icon: '✦', hint: 'Ask any question…' },
  { id: 'math', label: 'Math solver', icon: '∑', hint: 'Type a math problem…' },
  { id: 'code', label: 'Coding tutor', icon: '</>', hint: 'Ask about code or paste an error…' },
  { id: 'learn', label: 'Learn coding', icon: '⌘', hint: 'What do you want to learn today?' },
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [mode, setMode] = useState('ask');
  const [input, setInput] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([]);
  const activeMode = modes.find(m => m.id === mode) || modes[0];

  const send = async (preset) => {
    const question = (preset ?? input).trim();
    if (!question || busy) return;
    const userMessage = { role: 'user', content: question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setScreen('chat');
    setBusy(true);

    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, messages: nextMessages }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setMessages([...nextMessages, { role: 'assistant', content: data.answer }]);
    } catch (e) {
      setMessages([...nextMessages, {
        role: 'assistant',
        content: `I couldn't connect to the AI server. Check that the backend is running and the API URL is correct in Settings.\\n\\nDetails: ${e.message}`
      }]);
    } finally {
      setBusy(false);
    }
  };

  const newChat = () => { setMessages([]); setScreen('home'); };
  const goHome = () => setScreen('home');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#090D1D" />
      <LinearGradient colors={['#090D1D', '#111936', '#0C1024']} style={s.background}>
        <View style={s.topbar}>
          <TouchableOpacity onPress={goHome} style={s.brandRow}>
            <LinearGradient colors={['#7C5CFF', '#2ED8C5']} style={s.logo}><Text style={s.logoText}>A</Text></LinearGradient>
            <View><Text style={s.brand}>Agcchomd</Text><Text style={s.premium}>PREMIUM AI</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('settings')} style={s.settingsBtn}><Text style={s.settingsIcon}>⚙</Text></TouchableOpacity>
        </View>

        {screen === 'settings' ? (
          <ScrollView contentContainerStyle={s.settingsContent}>
            <Text style={s.pageTitle}>Settings</Text>
            <Text style={s.subTitle}>Personalize your Agcchomd experience.</Text>
            <View style={s.card}>
              <Text style={s.cardTitle}>AI server address</Text>
              <Text style={s.muted}>Enter the address of your backend server. Keep API keys on the server, never in this app.</Text>
              <TextInput value={apiUrl} onChangeText={setApiUrl} autoCapitalize="none" autoCorrect={false}
                placeholder="http://192.168.1.5:3000" placeholderTextColor="#78819E" style={s.urlInput} />
              <Text style={s.smallNote}>Android emulator: http://10.0.2.2:3000 · Physical phone: use your computer's local IP on the same Wi-Fi.</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>Developer</Text>
              <View style={s.developerRow}>
                <LinearGradient colors={['#7C5CFF', '#2ED8C5']} style={s.developerPhoto}><Text style={s.developerInitial}>A</Text></LinearGradient>
                <View style={{flex: 1}}><Text style={s.devName}>Agcchomd Developer</Text><Text style={s.muted}>App creator profile</Text></View>
              </View>
              <Text style={s.smallNote}>Replace the sample avatar and developer name with your own photo and details before publishing.</Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>About</Text>
              <Text style={s.muted}>Agcchomd helps you ask questions, understand math, and learn programming. AI answers may be incorrect—verify important information.</Text>
              <Text style={s.version}>Version 1.0.0 · Premium interface</Text>
            </View>
            <TouchableOpacity style={s.primaryBtn} onPress={() => { setScreen('home'); Alert.alert('Settings saved', 'Your server address has been saved for this session.'); }}>
              <Text style={s.primaryBtnText}>Save settings</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : screen === 'chat' ? (
          <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={s.chatHeading}>
              <View><Text style={s.pageTitle}>{activeMode.label}</Text><Text style={s.subTitle}>Ask clearly. Learn step by step.</Text></View>
              <TouchableOpacity onPress={newChat} style={s.newChatBtn}><Text style={s.newChatText}>＋ New</Text></TouchableOpacity>
            </View>
            <ScrollView style={s.messageScroll} contentContainerStyle={{paddingBottom:16}}>
              {messages.map((m, i) => (
                <View key={i} style={[s.messageBubble, m.role === 'user' ? s.userBubble : s.aiBubble]}>
                  <Text style={s.messageLabel}>{m.role === 'user' ? 'YOU' : 'AGCCHOMD AI'}</Text>
                  <Text selectable style={s.messageText}>{m.content}</Text>
                </View>
              ))}
              {busy && <View style={[s.messageBubble, s.aiBubble]}><Text style={s.messageText}>Thinking…</Text></View>}
            </ScrollView>
            <View style={s.composer}>
              <TextInput value={input} onChangeText={setInput} placeholder={activeMode.hint} placeholderTextColor="#858DA8"
                multiline style={s.composerInput} />
              <TouchableOpacity onPress={() => send()} disabled={busy || !input.trim()} style={[s.sendBtn, (busy || !input.trim()) && {opacity:0.45}]}>
                <Text style={s.sendText}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView contentContainerStyle={s.homeContent} showsVerticalScrollIndicator={false}>
            <View style={s.hero}>
              <View style={s.pill}><View style={s.pillDot}/><Text style={s.pillText}>YOUR ALL-IN-ONE AI COMPANION</Text></View>
              <Text style={s.heroTitle}>Big questions.{'\n'}Clear answers.</Text>
              <Text style={s.heroSub}>Explore ideas, solve math, and learn to code—all in one place.</Text>
              <LinearGradient colors={['#795BFF', '#4D8BFF', '#20CDBA']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.heroGlow}>
                <Text style={s.heroSpark}>✦</Text><Text style={s.heroGlowTitle}>Think beyond limits</Text><Text style={s.heroGlowSub}>Powered by AI · Built for curiosity</Text>
              </LinearGradient>
            </View>
            <Text style={s.sectionTitle}>Choose your workspace</Text>
            <View style={s.modeGrid}>
              {modes.map((m, i) => (
                <TouchableOpacity key={m.id} style={s.modeCard} onPress={() => { setMode(m.id); setScreen('chat'); }}>
                  <View style={[s.modeIcon, {backgroundColor: ['#30285E','#163C49','#392747','#193A51'][i]}]}><Text style={s.modeIconText}>{m.icon}</Text></View>
                  <Text style={s.modeTitle}>{m.label}</Text><Text style={s.modeDesc}>{['Get helpful explanations','Work through problems','Debug and understand code','Start from the basics'][i]}</Text>
                  <Text style={s.cardArrow}>↗</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.tipCard}><Text style={s.tipIcon}>💡</Text><View style={{flex:1}}><Text style={s.tipTitle}>Make learning a habit</Text><Text style={s.muted}>Ask follow-up questions whenever an answer is unclear.</Text></View></View>
            <Text style={s.footer}>AGCCHOMD · CURIOSITY HAS NO LIMITS</Text>
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#090D1D'}, background:{flex:1},
  topbar:{height:72,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderBottomColor:'#252C48'},
  brandRow:{flexDirection:'row',alignItems:'center',gap:10}, logo:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center'}, logoText:{fontSize:24,fontWeight:'900',color:'#fff'},
  brand:{color:'#fff',fontSize:20,fontWeight:'800',letterSpacing:0.2}, premium:{color:'#7EDFD4',fontSize:9,fontWeight:'800',letterSpacing:2,marginTop:2},
  settingsBtn:{width:42,height:42,borderRadius:14,backgroundColor:'#1B2340',alignItems:'center',justifyContent:'center'}, settingsIcon:{color:'#E8ECFF',fontSize:22},
  homeContent:{padding:20,paddingBottom:28}, hero:{paddingTop:14,paddingBottom:26}, pill:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:8,paddingVertical:8,paddingHorizontal:11,borderRadius:30,borderWidth:1,borderColor:'#343D65',backgroundColor:'#171D38'},
  pillDot:{width:7,height:7,borderRadius:4,backgroundColor:'#36D9BD'}, pillText:{fontSize:9,color:'#C7D0F2',letterSpacing:1.2,fontWeight:'800'},
  heroTitle:{fontSize:42,lineHeight:47,fontWeight:'900',color:'#fff',marginTop:20,letterSpacing:-1}, heroSub:{fontSize:15,lineHeight:23,color:'#AAB4D3',marginTop:12,maxWidth:330},
  heroGlow:{marginTop:22,borderRadius:22,padding:20,minHeight:128,justifyContent:'center'}, heroSpark:{fontSize:23,color:'#fff'}, heroGlowTitle:{fontSize:20,fontWeight:'800',color:'#fff',marginTop:5}, heroGlowSub:{fontSize:12,color:'#F0F2FF',marginTop:5},
  sectionTitle:{fontSize:18,fontWeight:'800',color:'#F7F8FF',marginBottom:14}, modeGrid:{flexDirection:'row',flexWrap:'wrap',gap:12}, modeCard:{width:'48%',flexGrow:1,minHeight:158,padding:15,borderRadius:20,backgroundColor:'#151C35',borderWidth:1,borderColor:'#293252'},
  modeIcon:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center',marginBottom:12}, modeIconText:{fontSize:20,color:'#E7E6FF',fontWeight:'800'}, modeTitle:{fontSize:15,color:'#fff',fontWeight:'800'}, modeDesc:{fontSize:11,lineHeight:16,color:'#AAB4D3',marginTop:5,paddingRight:5}, cardArrow:{position:'absolute',right:14,top:16,color:'#8F9BCA',fontSize:17},
  tipCard:{marginTop:20,backgroundColor:'#151C35',borderColor:'#293252',borderWidth:1,borderRadius:18,padding:16,flexDirection:'row',gap:12,alignItems:'center'}, tipIcon:{fontSize:24}, tipTitle:{color:'#F4F5FF',fontWeight:'800',marginBottom:4},
  muted:{color:'#AAB4D3',fontSize:13,lineHeight:20}, footer:{textAlign:'center',fontSize:9,letterSpacing:1.8,color:'#606B91',marginTop:25},
  chatHeading:{paddingHorizontal:20,paddingVertical:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, pageTitle:{fontSize:27,fontWeight:'900',color:'#fff'}, subTitle:{fontSize:12,color:'#AAB4D3',marginTop:4}, newChatBtn:{paddingHorizontal:12,paddingVertical:9,borderRadius:12,backgroundColor:'#252C4D'}, newChatText:{color:'#E7E9FF',fontWeight:'700'},
  messageScroll:{flex:1,paddingHorizontal:16}, messageBubble:{padding:15,borderRadius:18,marginVertical:7,maxWidth:'95%'}, userBubble:{alignSelf:'flex-end',backgroundColor:'#5142B8',borderBottomRightRadius:5}, aiBubble:{alignSelf:'flex-start',backgroundColor:'#171F3A',borderWidth:1,borderColor:'#2B3558',borderBottomLeftRadius:5},
  messageLabel:{fontSize:9,letterSpacing:1.3,fontWeight:'900',color:'#AEB8FF',marginBottom:7}, messageText:{fontSize:14,lineHeight:22,color:'#F4F5FF'},
  composer:{flexDirection:'row',alignItems:'flex-end',gap:9,paddingHorizontal:14,paddingVertical:12,borderTopWidth:1,borderTopColor:'#252C48',backgroundColor:'#0D1329'}, composerInput:{flex:1,maxHeight:120,minHeight:46,borderRadius:15,backgroundColor:'#1A2240',color:'#fff',paddingHorizontal:14,paddingVertical:12,fontSize:14}, sendBtn:{width:46,height:46,borderRadius:15,backgroundColor:'#7058F5',alignItems:'center',justifyContent:'center'}, sendText:{color:'#fff',fontSize:22,fontWeight:'900'},
  settingsContent:{padding:20,paddingBottom:40}, card:{backgroundColor:'#151C35',borderRadius:20,borderWidth:1,borderColor:'#293252',padding:17,marginTop:16}, cardTitle:{color:'#fff',fontSize:16,fontWeight:'800',marginBottom:9}, urlInput:{marginTop:13,borderRadius:12,backgroundColor:'#0D1329',borderWidth:1,borderColor:'#303A60',padding:13,color:'#fff',fontSize:13}, smallNote:{fontSize:11,lineHeight:17,color:'#7F8AAE',marginTop:10}, developerRow:{flexDirection:'row',alignItems:'center',gap:12,marginTop:4}, developerPhoto:{width:55,height:55,borderRadius:18,alignItems:'center',justifyContent:'center'}, developerInitial:{fontSize:27,fontWeight:'900',color:'#fff'}, devName:{fontSize:15,fontWeight:'800',color:'#fff',marginBottom:4}, version:{fontSize:11,color:'#7783A9',marginTop:13}, primaryBtn:{backgroundColor:'#7058F5',borderRadius:15,padding:16,alignItems:'center',marginTop:20}, primaryBtnText:{color:'#fff',fontSize:15,fontWeight:'800'}
});
