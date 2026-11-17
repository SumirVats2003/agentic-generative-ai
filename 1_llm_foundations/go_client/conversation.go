package main

var systemMsg = Message{Role: "system", Content: "You are a helpful AI Assistant. Help the user by answering his query"}
var Messages []Message = []Message{systemMsg}

var client Client = InitClient()

func Chat(user_query string) string {
	msg := Message{Role: "user", Content: user_query}
	Messages = append(Messages, msg)

	result := client.CallLLM(Messages)

	assistantMsg := Message{Role: "assistant", Content: result}
	Messages = append(Messages, assistantMsg)

	return result
}

func UpdateModelTemperature(temp float32) {
	client.SetTemperature(temp)
}
