# Etapa 2 - Batch 2 Translation - semaphoreLogic + results + remaining
$ErrorActionPreference = "Stop"
$root = "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_deploy_railway\src"
$pyroot = "C:\Users\USUARIO\Documents\projetosclaude\pwa_alcool_app\pwa_deploy_railway\public\py"
$count = 0

$replacements = @(
    # --- semaphoreLogic.ts ---
    @("'Etanol combustível'", "'Fuel ethanol'"),
    @("'Compatível'", "'Compatible'"),
    @("'Incompatível'", "'Incompatible'"),
    @("Compatibilidade entre rótulo e experimento", "Compatibility between label and experiment"),
    @("Incompatível com o rótulo", "Incompatible with the label"),
    @("Necessários mais dados experimentais", "More experimental data needed"),
    @("Possível presença de metanol", "Possible methanol presence"),
    
    # --- Results page labels ---
    @("Triagem de soluções hidroalcoólicas", "Hydroalcoholic solution screening"),
    @("Resultados da triagem", "Screening results"),
    @("Resultados da Triagem", "Screening Results"),
    @("Relatório de resultados", "Results report"),
    @("Relatório de Resultados", "Results Report"),
    @("Dados experimentais", "Experimental data"),
    @("Dados Experimentais", "Experimental Data"),
    @("Composição equivalente", "Equivalent composition"),
    @("Composição Equivalente", "Equivalent Composition"),
    @("Composições equivalentes", "Equivalent compositions"),
    @("Síntese analítica", "Analytical summary"),
    @("Síntese Analítica", "Analytical Summary"),
    @("síntese analítica", "analytical summary"),
    @("Condições experimentais", "Experimental conditions"),
    @("Condições Experimentais", "Experimental Conditions"),
    @("Viscosidade relativa", "Relative viscosity"),
    @("Viscosidade Relativa", "Relative Viscosity"),
    @("Viscosidade absoluta", "Absolute viscosity"),
    @("viscosidade relativa", "relative viscosity"),
    @("viscosidade absoluta", "absolute viscosity"),
    @("Densidade relativa", "Relative density"),
    @("Densidade Relativa", "Relative Density"),
    @("densidade relativa", "relative density"),
    @("Temperatura da água", "Water temperature"),
    @("Temperatura da amostra", "Sample temperature"),
    @("temperatura da água", "water temperature"),
    @("temperatura da amostra", "sample temperature"),
    @("Teor alcoólico", "Alcohol content"),
    @("teor alcoólico", "alcohol content"),
    @("Tipo de solução", "Solution type"),
    @("Composição esperada", "Expected composition"),
    @("composição esperada", "expected composition"),
    @("Composição estimada", "Estimated composition"),
    @("composição estimada", "estimated composition"),
    @("Incerteza experimental", "Experimental uncertainty"),
    @("incerteza experimental", "experimental uncertainty"),
    @("Tempo de escoamento", "Flow time"),
    @("tempo de escoamento", "flow time"),
    @("Tempos de escoamento", "Flow times"),
    @("tempos de escoamento", "flow times"),
    @("Tempos da água", "Water times"),
    @("Tempos da amostra", "Sample times"),
    @("Erro da malha", "Mesh error"),
    @("erro da malha", "mesh error"),
    @("Nenhum resultado", "No result"),
    @("Nenhuma análise", "No analysis"),
    @("Nenhum dado", "No data"),
    @("Sem indício", "No evidence"),
    @("sem indício", "no evidence"),
    @("presença de metanol", "methanol presence"),
    @("Presença de metanol", "Methanol presence"),
    @("Exportar", "Export"),
    @("exportar", "export"),
    @("Importar", "Import"),
    @("importar", "import"),
    @("Confirmar", "Confirm"),
    @("Baixar relatório", "Download report"),
    @("Baixar", "Download"),
    @("Compartilhar", "Share"),
    @("Novo", "New"),
    @("novo", "new"),
    @("Anterior", "Previous"),
    @("anterior", "previous"),
    @("Histórico de análises", "Analysis history"),
    @("histórico de análises", "analysis history"),
    @("Histórico", "History"),
    @("Análises anteriores", "Previous analyses"),
    @("análises anteriores", "previous analyses"),
    @("Última análise", "Last analysis"),
    @("última análise", "last analysis"),
    @("Abrir", "Open"),
    @("Fechar", "Close"),
    @("fechar", "close"),
    @("Ver detalhes", "View details"),
    @("ver detalhes", "view details"),
    @("Detalhes", "Details"),
    @("detalhes", "details"),
    @("Replicatas", "Replicates"),
    @("replicatas", "replicates"),
    @("replicata", "replicate"),
    @("Replicata", "Replicate"),
    @("Média", "Average"),
    @("média", "average"),
    @("Desvio", "Deviation"),
    @("desvio", "deviation"),
    @("Referência", "Reference"),
    @("referência", "reference"),
    @("Observações", "Notes"),
    @("observações", "notes"),
    @("Análise realizada em", "Analysis performed on"),
    @("Ferramenta de triagem", "Screening tool"),
    @("ferramenta de triagem", "screening tool"),
    @("não substitui análise laboratorial confirmatória", "does not replace confirmatory laboratory analysis"),
    @("Não substitui análise laboratorial confirmatória", "Does not replace confirmatory laboratory analysis"),
    
    # --- More StepDensity precision messages ---
    @("Massas líquidas devem ser positivas. Verifique os valores informados.", "Liquid masses must be positive. Check the values entered."),
    @("Não foi possível calcular o teor alcoólico. Valores fora do range esperado.", "Could not calculate the alcohol content. Values outside expected range."),
    @("Erro ao verificar compatibilidade. Tente novamente.", "Error checking compatibility. Try again."),
    @("Falha ao carregar tabela de conversão", "Failed to load conversion table"),
    
    # --- StepTimes remaining ---
    @("Registre o escoamento", "Record the flow"),
    @("Escoamento água", "Water flow"),
    @("Escoamento amostra", "Sample flow"),
    @("Vídeo", "Video"),
    @("vídeo", "video"),
    @("Manual", "Manual"),
    @("manual", "manual"),
    @("Tempo", "Time"),
    @("Inserção manual", "Manual entry"),
    @("inserção manual", "manual entry"),
    
    # --- AnalysisListPage ---
    @("Selecione análises", "Select analyses"),
    @("resultados encontrados", "results found"),
    @("Resultados encontrados", "Results found"),
    @("Filtrar", "Filter"),
    @("Limpar filtros", "Clear filters"),
    @("Ordenar por", "Sort by"),
    @("Data", "Date"),
    @("data", "date"),
    
    # --- Layout ---
    @("Triagem Analítica", "Analytical Screening"),
    @("triagem analítica", "analytical screening")
)

$files = Get-ChildItem -Path $root -Recurse -Include "*.tsx","*.ts" -Exclude "methodologyContent.tsx"
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
    $original = $content
    foreach ($pair in $replacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $count++
        Write-Output "Updated: $($file.Name)"
    }
}

# Also update Python files for Compatível/Incompatível
$pyFiles = Get-ChildItem -Path $pyroot -Recurse -Include "*.py"
$pyReplacements = @(
    @("'Compatível'", "'Compatible'"),
    @("'Incompatível'", "'Incompatible'"),
    @('"Compatível"', '"Compatible"'),
    @('"Incompatível"', '"Incompatible"'),
    @("'Etanol combustível'", "'Fuel ethanol'")
)
foreach ($file in $pyFiles) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.UTF8Encoding]::new($false))
    $original = $content
    foreach ($pair in $pyReplacements) {
        $content = $content.Replace($pair[0], $pair[1])
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        $count++
        Write-Output "Updated PY: $($file.Name)"
    }
}

Write-Output "Total files updated batch 2: $count"
