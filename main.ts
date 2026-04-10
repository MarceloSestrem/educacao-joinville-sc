//% weight=100 color=#2E86AB icon="\uf5fc"
namespace Educacao_Joinville {
}

/* =========================
   📟 LCD
========================= */
//% weight=90 color=#1ABC9C icon="\uf26c"
namespace EJ_LCD {

    let endereco = 0x27

    function cmd(valor: number) {
        pins.i2cWriteNumber(endereco, valor, NumberFormat.UInt8BE)
        basic.pause(5)
    }

    //% block="iniciar LCD"
    //% group="LCD"
    export function iniciar() {
        cmd(0x38)
        cmd(0x0C)
        cmd(0x06)
        limpar()
    }

    //% block="limpar LCD"
    //% group="LCD"
    export function limpar() {
        cmd(0x01)
        basic.pause(5)
    }

    //% block="mostrar %texto na linha %linha coluna %coluna"
    //% group="LCD"
    export function mostrar(texto: string, linha: number, coluna: number) {
        let pos = linha == 1 ? 0x80 + coluna : 0xC0 + coluna
        cmd(pos)
        for (let i = 0; i < texto.length; i++) {
            pins.i2cWriteNumber(endereco, texto.charCodeAt(i), NumberFormat.UInt8BE)
        }
    }

    //% block="exibir mensagem longa %texto na linha %linha velocidade %velocidade (ms)"
    //% group="LCD"
    export function scrollText(texto: string, linha: number, velocidade: number): void {

        let largura = 16

        if (texto.length <= largura) {
            mostrar(texto, linha, 0)
            return
        }

        for (let i = 0; i <= texto.length - largura; i++) {

            let parte = texto.substr(i, largura)

            mostrar(parte, linha, 0)

            basic.pause(velocidade)
        }

        basic.pause(velocidade * 2)
        limpar()
    }
}

/* =========================
   🔧 MOTORES
========================= */
//% weight=95 color=#34495E icon="\uf1b9"
namespace EJ_Motores {

    let m1a = AnalogPin.P0
    let m1b = AnalogPin.P1
    let m2a = AnalogPin.P2
    let m2b = AnalogPin.P8

    function motor(pin1: AnalogPin, pin2: AnalogPin, vel: number) {
        if (vel >= 0) {
            pins.analogWritePin(pin1, vel * 10)
            pins.analogWritePin(pin2, 0)
        } else {
            pins.analogWritePin(pin1, 0)
            pins.analogWritePin(pin2, -vel * 10)
        }
    }

    //% block="frente velocidade %vel"
    export function frente(vel: number) {
        motor(m1a, m1b, vel)
        motor(m2a, m2b, vel)
    }

    //% block="ré velocidade %vel"
    export function tras(vel: number) {
        motor(m1a, m1b, -vel)
        motor(m2a, m2b, -vel)
    }

    //% block="esquerda velocidade %vel"
    export function esquerda(vel: number) {
        motor(m1a, m1b, -vel)
        motor(m2a, m2b, vel)
    }

    //% block="direita velocidade %vel"
    export function direita(vel: number) {
        motor(m1a, m1b, vel)
        motor(m2a, m2b, -vel)
    }

    //% block="parar motores"
    export function parar() {
        motor(m1a, m1b, 0)
        motor(m2a, m2b, 0)
    }
}

/* =========================
   🚗 SEGUIDOR DE LINHA
========================= */
//% weight=90 color=#E74C3C icon="\uf1b9"
namespace EJ_Linha {

    //% block="seguir linha esq %esq dir %dir"
    export function seguirLinha(esq: DigitalPin, dir: DigitalPin) {

        let esquerda = pins.digitalReadPin(esq)
        let direita = pins.digitalReadPin(dir)

        if (esquerda == 0 && direita == 0) {
            EJ_Motores.frente(80)
        } else if (esquerda == 0 && direita == 1) {
            EJ_Motores.esquerda(70)
        } else if (esquerda == 1 && direita == 0) {
            EJ_Motores.direita(70)
        } else {
            EJ_Motores.parar()
        }
    }
}

/* =========================
   📏 DISTÂNCIA
========================= */
//% weight=80 color=#9B59B6 icon="\uf2c2"
namespace EJ_Distancia {

    //% block="distância trig %trig echo %echo (cm)"
    export function distancia(trig: DigitalPin, echo: DigitalPin): number {

        pins.digitalWritePin(trig, 0)
        control.waitMicros(2)

        pins.digitalWritePin(trig, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trig, 0)

        let d = pins.pulseIn(echo, PulseValue.High, 500 * 58)

        return Math.round(d / 58)
    }
}

/* =========================
   🌡️ ANALÓGICOS
========================= */
//% weight=80 color=#E67E22 icon="\uf043"
namespace EJ_SensoresAnalogicos {

    //% block="luz %pin"
    export function luz(pin: AnalogPin): number {
        return pins.map(pins.analogReadPin(pin), 0, 1023, 0, 100)
    }

    //% block="umidade solo %pin"
    export function solo(pin: AnalogPin): number {
        return pins.map(pins.analogReadPin(pin), 0, 1023, 0, 100)
    }
}

/* =========================
   🔘 DIGITAIS
========================= */
//% weight=80 color=#3498DB icon="\uf085"
namespace EJ_SensoresDigitais {

    //% block="toque %pin"
    export function toque(pin: DigitalPin): number {
        return pins.digitalReadPin(pin)
    }

    //% block="vibração %pin"
    export function vibracao(pin: DigitalPin): number {
        return pins.digitalReadPin(pin)
    }
}

/* =========================
   🌍 AMBIENTE
========================= */
//% weight=70 color=#16A085 icon="\uf06c"
namespace EJ_Ambiente {

    let temp = 0
    let umi = 0

    //% block="ler ambiente %pin"
    export function ler(pin: DigitalPin) {
        temp = input.temperature()
        umi = 50
    }

    //% block="temperatura"
    export function temperatura(): number {
        return temp
    }

    //% block="umidade"
    export function umidade(): number {
        return umi
    }
}

/* =========================
   🎨 COR
========================= */
//% weight=70 color=#F1C40F icon="\uf53f"
namespace EJ_Cor {

    //% block="detectar cor"
    export function cor(): string {
        let v = input.lightLevel()

        if (v < 50) return "Preto"
        if (v < 100) return "Azul"
        if (v < 150) return "Verde"
        return "Branco"
    }
}

/* =========================
   👋 GESTOS
========================= */
//% weight=70 color=#8E44AD icon="\uf0a6"
namespace EJ_Gestos {

    //% block="quando agitar"
    export function aoAgitar(handler: () => void) {
        input.onGesture(Gesture.Shake, handler)
    }
}

/* =========================
   🔢 TECLADO
========================= */
//% weight=60 color=#2ECC71 icon="\uf11c"
namespace EJ_Teclado {

    //% block="tecla %pin"
    export function tecla(pin: DigitalPin): number {
        return pins.digitalReadPin(pin)
    }
}

/* =========================
   📡 NFC (BASE)
========================= */
//% weight=60 color=#34495E icon="\uf02a"
namespace EJ_NFC {

    //% block="ler NFC"
    export function ler(): number {
        return 1
    }
}