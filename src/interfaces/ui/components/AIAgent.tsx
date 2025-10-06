"use client";

import { useState } from 'react';
import { getFeatureFlag, isAIAgentMode } from '../../../../config/feature-flags';
import Card from '@/interfaces/ui/components/atoms/Card';
import Button from '@/interfaces/ui/components/atoms/Button';
import Input from '@/interfaces/ui/components/atoms/Input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Rule-based responses for demo mode
const DEMO_RESPONSES: Record<string, string> = {
  'đường huyết': 'Đường huyết hôm qua của bạn là 119 mg/dL, trong mức bình thường. Hãy tiếp tục duy trì chế độ ăn uống lành mạnh!',
  'nước': 'Bạn đã uống 6/8 cốc nước hôm qua. Hãy nhớ uống thêm 2 cốc nữa để đạt mục tiêu nhé!',
  'bữa ăn': 'Hôm qua bạn đã ghi 3 bữa ăn. Hãy thêm nhiều rau xanh và protein để cân bằng dinh dưỡng.',
  'vận động': 'Bạn đã đi 4,250 bước hôm qua. Hãy cố gắng đạt 6,000 bước mỗi ngày để cải thiện sức khỏe!',
  'default': 'Tôi có thể giúp bạn theo dõi đường huyết, nước uống, bữa ăn và vận động. Bạn muốn hỏi gì?'
};

export default function AIAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Xin chào! Tôi là trợ lý AI của DIABOT. Tôi có thể giúp bạn theo dõi sức khỏe. Bạn muốn hỏi gì?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Don't render if AI agent is disabled
  if (isAIAgentMode('off')) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getResponse(inputText.toLowerCase());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const getResponse = (input: string): string => {
    for (const [keyword, response] of Object.entries(DEMO_RESPONSES)) {
      if (keyword !== 'default' && input.includes(keyword)) {
        return response;
      }
    }
    return DEMO_RESPONSES.default;
  };

  return (
    <Card className="max-w-md mx-auto" data-testid="ai-agent">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">🤖 Trợ lý AI</h3>
       <span className="text-xs text-muted">
  {isAIAgentMode('demo') ? 'Demo Mode' : 'Live'}
</span>
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto" data-testid="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text'
              }`}
              data-testid={`message-${message.sender}`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-muted">
              Đang trả lời...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Hỏi về đường huyết, nước uống..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          data-testid="chat-input"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputText.trim() || isTyping}
          data-testid="send-message"
        >
          Gửi
        </Button>
      </div>
    </Card>
  );
}