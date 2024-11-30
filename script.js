const dadosConversao = {
    cotacoes: {},
    entrada: {
        valor: undefined,
        moeda: undefined,
    },
    saida: {
        moeda: undefined,
    }
}


async function receberParamUser() {
    dadosConversao.entrada.valor = document.querySelector('.entrada .valor').value
    dadosConversao.entrada.moeda = document.querySelector('.entrada .moeda').value
    dadosConversao.saida.moeda = document.querySelector('.saida .moeda').value
}

async function carregarConvMoedas() {
    try {
        const url = 'https://api2.binance.com/api/v3/ticker/24hr'
        const response = await fetch(url)
        const json = await response.json()
        return json
    } catch (erro) {
        return window.cotacaoMoedasPadrao
    }
}

async function receiveDados() {
    if (dadosConversao.cotacoes.length > 0) {
        return
    }
    const moedas = await carregarConvMoedas()

    const paraBtc = moedas
        .filter(cotacao => cotacao.symbol.endsWith("BTC"))
        .map(cotacao => ({
            moeda: cotacao.symbol.substring(0, cotacao.symbol.indexOf("BTC")),
            valor: parseFloat(cotacao.lastPrice)
        }))
    
    const deBtc = moedas
        .filter(cotacao => cotacao.symbol.startsWith("BTC"))
        .map(cotacao => ({
            moeda: cotacao.symbol.substring(3),
            valor: 1 / parseFloat(cotacao.lastPrice)
        }))
    
        dadosConversao.cotacoes =  [ 
            ...paraBtc,
            ...deBtc
        ]
}

async function calcResult() {
    const valueEntrada = parseFloat(dadosConversao.entrada.valor)
    const moedaEntrada = (dadosConversao.entrada.moeda || "BTC").toUpperCase()
    const moedaSaida = (dadosConversao.saida.moeda || "USDT").toUpperCase()

    if (isNaN(valueEntrada)) {
        console.error(`ERRO: Valor de entrada deve ser numérico.`)
        return
    }

    const cotacaoMoedaEntradaBtc = moedaEntrada === "BTC" 
        ? 1 
        : dadosConversao.cotacoes.find(cotacao => cotacao.moeda === moedaEntrada)?.valor

    if (cotacaoMoedaEntradaBtc === undefined) {
        console.error(`ERRO: Moeda não existe "${moedaEntrada}".`)
    }
    const cotacaoMoedaSaidaBtc = moedaSaida === "BTC"
        ? 1    
        : dadosConversao.cotacoes.find(cotacao => cotacao.moeda === moedaSaida)?.valor
    if (cotacaoMoedaSaidaBtc === undefined) {
        console.error(`ERRO: Moeda não existe "${moedaSaida}".`)
    }

    if (cotacaoMoedaEntradaBtc === undefined || cotacaoMoedaSaidaBtc === undefined) {
        return
    }
    
    const razao = cotacaoMoedaEntradaBtc / cotacaoMoedaSaidaBtc
    const valueSaida = valueEntrada * razao

    document.querySelector('.saida .valor').value = valueSaida
}

function complCoinsList(select, moedas) {
    const selecao = select.value
    select.innerHTML = ""
    moedas.forEach(moeda => {
        const option = document.createElement('option')
        option.value = moeda
        option.innerHTML = moeda
        select.appendChild(option)
    })
    select.value = selecao
}

function complCoins() {
    let moedas = dadosConversao.cotacoes.map(cotacao => cotacao.moeda)
    moedas.push('BTC')
    moedas = moedas.filter(moeda => moeda).sort()


    complCoinsList(document.querySelector('.entrada .moeda'), moedas)
    complCoinsList(document.querySelector('.saida .moeda'), moedas)
}

async function convert() {
    await receiveDados()
    complCoins()
    await receberParamUser()
    await calcResult()
}

convert()