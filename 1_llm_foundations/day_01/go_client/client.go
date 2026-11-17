package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type response struct {
	Message responseMsg `json:"message"`
}

type responseMsg struct {
	Content string `json:"content"`
}

type options struct {
	Temperature float32 `json:"temperature"`
}

type payload struct {
	Model    string    `json:"model"`
	Messages []Message `json:"messages"`
	Stream   bool      `json:"stream"`
	Options  options   `json:"options"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type Client struct {
	model       string
	temperature float32
	url         string
}

func (c *Client) CallLLM(messages []Message) string {
	data := payload{
		Model:    c.model,
		Messages: messages,
		Stream:   false,
		Options:  options{Temperature: 0.2},
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Printf("Error while marshalling data: %v", err)
		panic(0)
	}

	resp, err := http.Post(c.url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("Error making POST request: %v", err)
		panic(0)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response: %v", err)
		panic(0)
	}

	var result response
	err = json.Unmarshal(body, &result)
	if err != nil {
		fmt.Printf("Error Unmarshalling response %v", err)
		panic(0)
	}

	return result.Message.Content
}

func (c *Client) SetTemperature(temp float32) {
	c.temperature = temp
}

func InitClient() Client {
	return Client{
		model:       "gemma:2b",
		temperature: 0.2,
		url:         "http://localhost:11434/api/chat",
	}
}
