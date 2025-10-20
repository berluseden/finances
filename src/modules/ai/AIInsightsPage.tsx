'use client';

import { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFinancialContext } from './hooks/useFinancialContext';
import { useChatHistory } from './hooks/useChatHistory';
import {
  generateFinancialRecommendations,
  forecastExpenses,
  financialChatbot,
  isAIAvailable,
} from '@/services/ai';
import { Sparkles, Brain, TrendingUp, Zap, MessageCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  estimatedSavings?: number;
}

interface Forecast {
  month: string;
  totalExpected: number;
  byCategory: Record<string, number>;
  confidence: number;
  reasoning: string;
}

export function AIInsightsPage() {
  const { data: context, isLoading: contextLoading } = useFinancialContext();
  const { messages: chatHistory, loading: historyLoading, saveMessage, clearHistory } = useChatHistory();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'forecast' | 'chat'>('overview');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Refs para autoscroll
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [chatMessages, isSendingMessage]);

  // Cargar historial de conversaciones cuando esté disponible
  useEffect(() => {
    if (!historyLoading && chatHistory.length > 0) {
      console.log('[AIInsightsPage] 📚 Cargando historial de conversaciones en chatbot');
      
      // Convertir historial de Firestore a formato del chatbot
      const historyMessages = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Cargar en el chatbot para que tenga contexto
      financialChatbot.loadHistory(historyMessages);
      
      // Mostrar en UI
      setChatMessages(historyMessages);
    }
  }, [chatHistory, historyLoading]);

  // Cargar recomendaciones y pronósticos cuando el contexto esté listo
  useEffect(() => {
    if (!context || !isAIAvailable()) return;

    // Actualizar contexto financiero en el chatbot
        financialChatbot.setUserContext({
          monthlyIncome: context.monthlyIncome,
          monthlyExpenses: context.monthlyExpenses,
          savingsRate: context.savingsRate,
          financialHealth: context.financialHealth,
          totalBalance: context.totalBalance,
          topCategories: context.topCategories,
          recurringExpenses: context.recurringExpenses || [], // Pasar el array tal como está
          accountsCount: context.accounts.length,
          transactionsCount: context.transactions.length,
        });    const loadInsights = async () => {
      try {
        setIsGenerating(true);
        console.log('[AIInsightsPage] 🤖 Generando insights personalizados...');

        // Generar recomendaciones
        const recs = await generateFinancialRecommendations({
          transactions: context.transactions,
          accounts: context.accounts,
          monthlyIncome: context.monthlyIncome,
          monthlyExpenses: context.monthlyExpenses,
        });
        setRecommendations(recs);

        // Generar pronósticos
        const fcst = await forecastExpenses(context.transactions, 3);
        setForecast(fcst);

        console.log('[AIInsightsPage] ✅ Insights generados:', {
          recomendaciones: recs.length,
          pronósticos: fcst.length,
        });
      } catch (error) {
        console.error('[AIInsightsPage] ❌ Error generando insights:', error);
        toast.error('Error al generar insights de IA');
      } finally {
        setIsGenerating(false);
      }
    };

    loadInsights();
  }, [context]);

  const handleSendMessage = async (overrideMessage?: string) => {
    const messageToSend = (overrideMessage ?? chatInput).trim();
    if (!messageToSend || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
  const userMessage = messageToSend;
  if (!overrideMessage) setChatInput('');

      // Agregar mensaje del usuario a UI
      setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
      
      // Guardar mensaje del usuario en Firestore
      await saveMessage('user', userMessage);

      // Enviar al chatbot (que ya tiene el historial completo cargado)
  const response = await financialChatbot.chat(userMessage);

      // Agregar respuesta del asistente a UI
  setChatMessages((prev) => [...prev, { role: 'assistant', content: response.message }]);
  setFollowUps(response.suggestedFollowUps || []);
      
      // Guardar respuesta del asistente en Firestore
      await saveMessage('assistant', response.message);

      console.log('[AIInsightsPage] 💬 Conversación guardada en Firestore');
    } catch (error) {
      console.error('[AIInsightsPage] ❌ Error en chatbot:', error);
      toast.error('Error al enviar mensaje');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setChatMessages([]);
      financialChatbot.reset();
      toast.success('Historial de conversaciones eliminado');
    } catch (error) {
      console.error('[AIInsightsPage] ❌ Error eliminando historial:', error);
      toast.error('Error al eliminar historial');
    }
  };

  if (contextLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando contexto financiero...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!context) {
    return (
      <DashboardLayout>
        <Card className="border-red-300 bg-red-50 dark:bg-red-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  No hay datos para mostrar
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                  Necesitamos que agregues transacciones o cuentas para generar insights de IA.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Análisis Financiero con IA</h1>
              <p className="text-white/80 mt-1">
                Insights inteligentes basados en tus datos reales
              </p>
            </div>
          </div>

          {/* Resumen rápido */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-white/80 mb-1">Ingresos Mensuales</div>
              <div className="text-2xl font-bold text-white">
                ${context.monthlyIncome.toLocaleString()}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-white/80 mb-1">Gastos Mensuales</div>
              <div className="text-2xl font-bold text-white">
                ${context.monthlyExpenses.toLocaleString()}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-white/80 mb-1">Tasa de Ahorro</div>
              <div className="text-2xl font-bold text-white">
                {(context.savingsRate * 100).toFixed(1)}%
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-white/80 mb-1">Salud Financiera</div>
              <div className="text-2xl font-bold text-white capitalize">
                {context.financialHealth}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="rounded-b-none"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Resumen
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('recommendations')}
            className="rounded-b-none"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Recomendaciones
          </Button>
          <Button
            variant={activeTab === 'forecast' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('forecast')}
            className="rounded-b-none"
          >
            <Zap className="w-4 h-4 mr-2" />
            Pronósticos
          </Button>
          <Button
            variant={activeTab === 'chat' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('chat')}
            className="rounded-b-none"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Chatbot
          </Button>
        </div>

        {/* Contenido por Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Gastos Recurrentes */}
            {context.recurringExpenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                    Gastos Recurrentes (Auto-Detectados)
                  </CardTitle>
                  <CardDescription>
                    Estos gastos se repiten automáticamente cada mes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {context.recurringExpenses.slice(0, 5).map((expense, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-lg border border-purple-200 dark:border-purple-800"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {expense.description}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {expense.frequency} • Confianza: {(expense.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ${expense.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            Visto: {expense.lastSeen}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Categorías */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categorías de Gasto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {context.topCategories.slice(0, 5).map((category, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {category.name}
                          </span>
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            ${category.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{
                              width: `${(category.amount / Math.max(...context.topCategories.map((c) => c.amount))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {isGenerating ? (
              <Card>
                <CardContent className="p-8 flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-gray-600 dark:text-gray-400">Generando recomendaciones personalizadas...</span>
                </CardContent>
              </Card>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <Card
                  key={idx}
                  className={`border-l-4 ${
                    rec.impact === 'high'
                      ? 'border-l-red-500'
                      : rec.impact === 'medium'
                        ? 'border-l-yellow-500'
                        : 'border-l-blue-500'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription className="mt-2">{rec.description}</CardDescription>
                      </div>
                      {rec.estimatedSavings && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${rec.estimatedSavings.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Ahorro potencial</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-2">
                          Pasos a seguir:
                        </h4>
                        <ul className="space-y-2">
                          {rec.actionItems.map((item, jdx) => (
                            <li key={jdx} className="flex items-start gap-2 text-sm">
                              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                              <span className="text-gray-700 dark:text-gray-300">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No se pudieron generar recomendaciones. Intenta más tarde.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="space-y-4">
            {isGenerating ? (
              <Card>
                <CardContent className="p-8 flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-gray-600 dark:text-gray-400">Generando pronósticos...</span>
                </CardContent>
              </Card>
            ) : forecast.length > 0 ? (
              forecast.map((month, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{month.month}</CardTitle>
                        <CardDescription className="mt-2">{month.reasoning}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          ${month.totalExpected.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Confianza: {(month.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(month.byCategory).map(([category, amount]) => (
                        <div key={category} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {category}
                          </div>
                          <div className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-1">
                            ${(amount as number).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No se pudieron generar pronósticos. Intenta más tarde.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Asistente de Finanzas con IA</CardTitle>
                <CardDescription>
                  Haz preguntas sobre tu situación financiera. El asistente tiene acceso a todos tus datos y recuerda tus conversaciones anteriores.
                </CardDescription>
              </div>
              {chatMessages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  🗑️ Limpiar historial
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Mensajes */}
              <div
                ref={messagesContainerRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
                  setShowScrollToBottom(!nearBottom);
                }}
                className="relative flex-1 overflow-y-auto mb-4 space-y-4 pr-2"
                aria-live="polite"
              >
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>Hola! Soy tu asistente financiero.</p>
                      <p className="text-sm mt-2">
                        Puedo ayudarte con preguntas como: "¿Cómo puedo ahorrar más?" o "¿Cuál es mi mayor gasto?"
                      </p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              {/* Sugerencias de seguimiento */}
              {followUps.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {followUps.map((s, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendMessage(s)}
                      disabled={isSendingMessage}
                      className="!px-3 !py-1 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              )}
                {isSendingMessage && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
                {/* Sentinel para autoscroll */}
                <div ref={messagesEndRef} />
                {showScrollToBottom && (
                  <div className="sticky bottom-3 flex justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => scrollToBottom(true)}
                      className="shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200 dark:border-gray-700"
                    >
                      Ir al final
                    </Button>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escribe tu pregunta..."
                  disabled={isSendingMessage}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isSendingMessage || !chatInput.trim()}
                  className="px-6"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información sobre la IA */}
        <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ¿Cómo funciona el análisis con IA?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                  Utilizamos <a href="https://openai.com/es-419/gpt-5/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 font-semibold underline">OpenAI GPT-5</a> (el modelo más avanzado) para analizar tus datos financieros en tiempo real. La IA tiene acceso a:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Todas tus transacciones históricas ({context.transactions.length}+)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Gastos recurrentes detectados automáticamente ({context.recurringExpenses.length})</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Ingresos y gastos mensuales reales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Patrones de gasto por categoría</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Tu salud financiera general</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  💡 Tip: Mientras más datos agregues, más precisos serán los análisis y recomendaciones.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
