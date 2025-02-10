async function obterComunicacoes(dataInicio, dataFim) {
    const url = `https://comunicaapi.pje.jus.br/api/v1/comunicacao?numeroOab=164024&ufOab=RJ&dataDisponibilizacaoInicio=${dataInicio}&dataDisponibilizacaoFim=${dataFim}`;

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
            // Criando os dados formatados para o Excel
            const listaProcessada = dados.items.map(item => ({
                "ID": item.id || "",
                "Data Disponibilização": item.data_disponibilizacao || "",
                "Tribunal": item.siglaTribunal || "",
                "Tipo Comunicação": item.tipoComunicacao || "",
                "Órgão": item.nomeOrgao || "",
                "Texto": item.texto || "",
                "Número Processo": item.numero_processo || "",
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

            // Gerando e baixando o arquivo Excel
            XLSX.writeFile(wb, "comunicacoes_oab.xlsx");

            alert("Arquivo Excel gerado com sucesso!");
        } else {
            alert("Nenhuma comunicação encontrada.");
        }
    } catch (error) {
        console.error("Erro ao obter comunicações:", error);
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}
