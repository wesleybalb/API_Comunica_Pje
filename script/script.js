async function obterComunicacoes() {
    let dataInicio = document.getElementById("dataInicio").value;
    let dataFim = document.getElementById("dataFim").value;
    let oab = document.getElementById("OAB").value;
    let ufOab = document.getElementById("UF").value;

    const url = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=${oab}&ufOab=${ufOab}&dataDisponibilizacaoInicio=${dataInicio}&dataDisponibilizacaoFim=${dataFim}`;

    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json"
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} - ${await response.text()}`);
        }

        const dados = await response.json();

        if (dados.items && Array.isArray(dados.items)) {
            // Função para formatar o número do processo
            function formatarNumeroProcesso(numero) {
                if (!numero || numero.length !== 20) return numero;
                return `${numero.slice(0, 7)}-${numero.slice(7, 9)}.${numero.slice(9, 13)}.${numero.slice(13, 14)}.${numero.slice(14, 16)}.${numero.slice(16)}`;
            }

            // Criando os dados formatados para o Excel
            const listaProcessada = dados.items.map(item => ({
                "ID": item.id || "",
                "Data Disponibilização": item.data_disponibilizacao || "",
                "Tribunal": item.siglaTribunal || "",
                "Tipo Comunicação": item.tipoComunicacao || "",
                "Órgão": item.nomeOrgao || "",
                "Texto": item.texto || "",
                "Número Processo": formatarNumeroProcesso(item.numero_processo || ""),
                "Link": item.link || "",
                "Tipo Documento": item.tipoDocumento || "",
                "Classe": item.nomeClasse || "",
                "Número Comunicação": item.numeroComunicacao || "",
                "Status": item.status || "",
                "Meio": item.meiocompleto || "",
                "Destinatários": (item.destinatarios || []).map(dest => dest.nome).join(", "),
                "Advogados": (item.destinatarioadvogados || []).map(adv => adv.advogado.nome).join(", ")
            }));

            // Criando a planilha
            const ws = XLSX.utils.json_to_sheet(listaProcessada);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Comunicações OAB");

            // Gerando nome do arquivo com data e hora
            const now = new Date();
            const timestamp = `${now.getFullYear()}_${(now.getMonth() + 1).toString().padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            const fileName = `comunicacoes_oab_${timestamp}.xlsx`;

            // Gerando e baixando o arquivo Excel
            XLSX.writeFile(wb, fileName);

            alert("Arquivo Excel gerado com sucesso!");
        } else {
            alert("Nenhuma comunicação encontrada.");
        }
    } catch (error) {
        console.error("Erro ao obter comunicações:", error);
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}
