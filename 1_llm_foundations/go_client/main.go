package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"
)

var temp_regex = regexp.MustCompile(`^/temp (?:0(?:\.\d+)?|1(?:\.0+)?|\.\d+)$`)

func main() {
	fmt.Println("Welcome to AI Chat")
	fmt.Println("Chat with the LLM or type /exit to quit")
	fmt.Println("Use /temp to change model temperature")
	fmt.Println("=========================================")
	fmt.Println()

	for {
		scanner := bufio.NewScanner(os.Stdin)
		fmt.Print("👤 ")

		var text string

		if scanner.Scan() {
			text = scanner.Text()
		}

		if err := scanner.Err(); err != nil {
			fmt.Println("Error reading input:", err)
		}

		if text == "/exit" {
			os.Exit(0)
		}

		if temp_regex.MatchString(text) {
			temperature := strings.Split(text, " ")[1]
			tempFloat, err := strconv.ParseFloat(temperature, 32)
			if err != nil {
				fmt.Println("Please enter a floating point number between 0 and 1")
			}
			client.SetTemperature(float32(tempFloat))

			continue
		}

		result := Chat(text)

		fmt.Printf("🤖 %v\n", result)
	}
}
