//% weight=100 color=#2E86AB icon="\uf5fc"
namespace Educacao_Joinville { }

/* =========================
   📟 LCD
========================= */
//% weight=90 color=#1ABC9C icon="\uf26c"
namespace EJ_LCD {

    let endereco = 0x27

    //% block="configurar LCD endereço %addr"
    export function configurar(addr: number) {
        endereco = addr
    }

    function cmd(c: number) {
        pins.i2cWriteNumber(endereco, c, NumberFormat.UInt8BE)
        basic.pause(5)
    }

    //% block="iniciar LCD"
    export function iniciar() {
        cmd(0x38)
        cmd(0x0C)
        cmd(0x06)
        limpar()
    }

    //% block="limpar LCD"
    export function limpar() {
        cmd(0x01)
    }

    //% block="mostrar %txt linha %l coluna %c"
    export function mostrar(txt: string, l: number, c: number) {
        let pos = l == 1 ? 0x80 + c : 0xC0 + c
        cmd(pos)

        for (let i = 0; i < txt.length; i++) {
            pins.i2cWriteNumber(endereco, txt.charCodeAt(i), NumberFormat.UInt8BE)
        }
    }

    //% block="rolar %txt linha %l velocidade %v"
    export function rolar(txt: string, l: number, v: number) {
        if (txt.length <= 16) {
            mostrar(txt, l, 0)
            return
        }

        for (let i = 0; i <= txt.length - 16; i++) {
            mostrar(txt.substr(i, 16), l, 0)
            basic.pause(v)
        }

        limpar()
    }
}

/* =========================
   🔧 MOTORES
========================= */
//% weight=95 color=#34495E icon="\uf1b9"
namespace EJ_Motores {

    let m1a: AnalogPin
    let m1b: AnalogPin
    let m2a: AnalogPin
    let m2b: AnalogPin

    //% block="configurar motores %a1 %b1 %a2 %b2"
    export function configurar(a1: AnalogPin, b1: AnalogPin, a2: AnalogPin, b2: AnalogPin) {
        m1a = a1; m1b = b1; m2a = a2; m2b = b2
    }

    function motor(p1: AnalogPin, p2: AnalogPin, v: number) {
        if (v >= 0) {
            pins.analogWritePin(p1, v * 10)
            pins.analogWritePin(p2, 0)
        } else {
            pins.analogWritePin(p1, 0)
            pins.analogWritePin(p2, -v * 10)
        }
    }

    //% block="frente %v"
    export function frente(v: number) {
        motor(m1a, m1b, v)
        motor(m2a, m2b, v)
    }

    //% block="parar"
    export function parar() {
        motor(m1a, m1b, 0)
        motor(m2a, m2b, 0)
    }
}

/* =========================
   🚗 LINHA
========================= */
//% weight=90 color=#E74C3C icon="\uf1b9"
namespace EJ_Linha {

    //% block="seguir linha %e %d"
    export function seguir(e: DigitalPin, d: DigitalPin) {

        let esq = pins.digitalReadPin(e)
        let dir = pins.digitalReadPin(d)

        if (esq == 0 && dir == 0) EJ_Motores.frente(80)
        else EJ_Motores.parar()
    }
}

/* =========================
   🧪 SENSORES
========================= */
//% weight=85 color=#3498DB
namespace EJ_Sensores {

    //% block="digital %p"
    export function digital(p: DigitalPin) {
        return pins.digitalReadPin(p)
    }

    //% block="analógico %p"
    export function analogico(p: AnalogPin) {
        return pins.analogReadPin(p)
    }
}

/* =========================
   📏 ULTRASSÔNICO
========================= */
//% weight=85 color=#9B59B6
namespace EJ_Ultrassonico {

    //% block="distância %t %e"
    export function distancia(t: DigitalPin, e: DigitalPin) {

        pins.digitalWritePin(t, 0)
        control.waitMicros(2)

        pins.digitalWritePin(t, 1)
        control.waitMicros(10)
        pins.digitalWritePin(t, 0)

        let tempo = pins.pulseIn(e, PulseValue.High)
        return Math.round(tempo / 58)
    }
}

/* =========================
   🌡️ DHT
========================= */
//% weight=80 color=#16A085
namespace EJ_Ambiente {

    let t = 0
    let u = 0

    //% block="ler DHT %p"
    export function ler(p: DigitalPin) {

        let dados: number[] = []

        pins.digitalWritePin(p, 0)
        basic.pause(18)
        pins.setPull(p, PinPullMode.PullUp)

        while (pins.digitalReadPin(p) == 1);
        while (pins.digitalReadPin(p) == 0);
        while (pins.digitalReadPin(p) == 1);

        for (let i = 0; i < 40; i++) {
            while (pins.digitalReadPin(p) == 0);
            let tempo = pins.pulseIn(p, PulseValue.High)
            dados.push(tempo > 40 ? 1 : 0)
        }

        u = dados[0] * 10 + dados[1]
        t = dados[2] * 10 + dados[3]
    }

    //% block="temperatura"
    export function temperatura() { return t }

    //% block="umidade"
    export function umidade() { return u }
}

/* =========================
   🔢 TECLADO
========================= */
//% weight=80 color=#2ECC71
namespace EJ_Teclado {

    let l: DigitalPin[] = []
    let c: DigitalPin[] = []

    let mapa = [
        ["1", "2", "3", "A"],
        ["4", "5", "6", "B"],
        ["7", "8", "9", "C"],
        ["*", "0", "#", "D"]
    ]

    //% block="configurar teclado"
    export function configurar(l1: DigitalPin, l2: DigitalPin, l3: DigitalPin, l4: DigitalPin,
        c1: DigitalPin, c2: DigitalPin, c3: DigitalPin, c4: DigitalPin) {

        l = [l1, l2, l3, l4]
        c = [c1, c2, c3, c4]
    }

    //% block="ler tecla"
    export function ler(): string {

        for (let i = 0; i < 4; i++) {
            pins.digitalWritePin(l[i], 0)

            for (let j = 0; j < 4; j++) {
                if (pins.digitalReadPin(c[j]) == 0) {
                    basic.pause(200)
                    return mapa[i][j]
                }
            }

            pins.digitalWritePin(l[i], 1)
        }

        return ""
    }
}

/* =========================
   📡 NFC (BASE FUNCIONAL)
========================= */
//% weight=80 color=#34495E
namespace EJ_NFC {

    let addr = 0x24

    //% block="configurar NFC %a"
    export function configurar(a: number) {
        addr = a
    }

    //% block="ler NFC"
    export function ler(): number {
        return pins.i2cReadNumber(addr, NumberFormat.UInt8BE)
    }
}

/* =========================
   🎨 COR (BASE)
========================= */
//% weight=80 color=#F1C40F
namespace EJ_Cor {

    //% block="nível de luz"
    export function luz() {
        return input.lightLevel()
    }
}

/* =========================
   👋 GESTOS
========================= */
//% weight=80 color=#8E44AD
namespace EJ_Gestos {

    //% block="quando agitar"
    export function agitar(handler: () => void) {
        input.onGesture(Gesture.Shake, handler)
    }
}