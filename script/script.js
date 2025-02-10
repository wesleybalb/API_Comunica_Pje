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
            let csvContent = "data:text/csv;charset=utf-8,";
            const headers = [
                "ID", "Data Disponibilização", "Tribunal", "Tipo Comunicação",
                "Órgão", "Texto", "Número Processo", "Link", "Tipo Documento",
                "Classe", "Número Comunicação", "Status", "Meio", "Destinatários", "Advogados"
            ];
            csvContent += headers.join(";") + "\n";

            dados.items.forEach(item => {
                const linha = [
                    item.id,
                    item.data_disponibilizacao,
                    item.siglaTribunal,
                    item.tipoComunicacao,
                    item.nomeOrgao,
                    `"${item.texto}"`, 
                    item.numero_processo,
                    item.link,
                    item.tipoDocumento,
                    item.nomeClasse,
                    item.numeroComunicacao,
                    item.status,
                    item.meiocompleto,
                    (item.destinatarios || []).map(dest => dest.nome).join(", "),
                    (item.destinatarioadvogados || []).map(adv => adv.advogado.nome).join(", ")
                ].map(value => value || "").join(";");

                csvContent += linha + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "comunicacoes_oab.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert("Arquivo CSV gerado com sucesso!");
        } else {
            alert("Nenhuma comunicação encontrada.");
        }
    } catch (error) {
        console.error("Erro ao obter comunicações:", error);
        alert("Erro ao obter comunicações. Veja o console para mais detalhes.");
    }
}
