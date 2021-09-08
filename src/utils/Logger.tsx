export default class Logger {
    static log(...args: any[]) {
        fetch('http://127.0.0.1:8000/log', {
            method: "POST",
            body: JSON.stringify(args),
            headers: {
                'Content-Type': 'text/plain',
            },
        })
            .then(r => r.text())
    }
}