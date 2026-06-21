import { useCallback, useRef } from 'react'
import { useChatStore } from '@/store'
import { chatApi } from '@/services/api'
import type { ChatMessage } from '@/types'

export function useChat() {
  const {
    messages,
    isLoading,
    conversationId,
    addMessage,
    setMessages,
    setIsLoading,
    setConversationId,
    clearMessages,
  } = useChatStore()

  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }

      addMessage(userMessage)
      setIsLoading(true)

      try {
        const response = await chatApi.sendMessage({
          message: content.trim(),
          session_id: conversationId ?? undefined,
        })

        addMessage({
          id: response.message.id,
          role: response.message.role as 'assistant',
          content: response.message.content,
          createdAt: response.message.created_at,
        })
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'I apologize, but I encountered an error. Please try again or contact support.',
          createdAt: new Date().toISOString(),
        }
        addMessage(errorMessage)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, conversationId, addMessage, setIsLoading]
  )

  const sendStreamMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }

      addMessage(userMessage)
      setIsLoading(true)

      const assistantMessageId = `assistant-${Date.now()}`
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }

      addMessage(assistantMessage)

      try {
        abortControllerRef.current = new AbortController()

        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            session_id: conversationId ?? undefined,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) throw new Error('Stream request failed')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No reader available')

        const decoder = new TextDecoder()
        let accumulatedContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk

          setMessages(
            messages
              .concat(userMessage)
              .concat([{ ...assistantMessage, content: accumulatedContent }])
          )
        }

        if (response.headers.get('x-conversation-id') && !conversationId) {
          setConversationId(response.headers.get('x-conversation-id')!)
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return

        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            'I apologize, but I encountered an error. Please try again or contact support.',
          createdAt: new Date().toISOString(),
        }
        addMessage(errorMsg)
        throw error
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [isLoading, conversationId, messages, addMessage, setIsLoading, setMessages, setConversationId]
  )

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    sendStreamMessage,
    cancelStream,
    clearMessages,
  }
}
