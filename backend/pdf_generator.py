import io
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def gerar_pdf_termo_responsabilidade(movimentacao) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=30,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DiaTitle',
        parent=styles['Heading1'],
        fontSize=12,
        leading=15,
        alignment=1, # Center
        textColor=colors.HexColor('#162052'),
        fontName='Helvetica-Bold',
        spaceAfter=4
    )

    company_banner_style = ParagraphStyle(
        'CompanyBanner',
        parent=styles['Normal'],
        fontSize=16,
        leading=19,
        alignment=0, # Left
        textColor=colors.HexColor('#162052'),
        fontName='Helvetica-Bold'
    )

    company_sub_style = ParagraphStyle(
        'CompanySub',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        alignment=0, # Left
        textColor=colors.HexColor('#EAB308'),
        fontName='Helvetica-Bold'
    )

    legal_cite_style = ParagraphStyle(
        'LegalCite',
        parent=styles['Normal'],
        fontSize=8,
        leading=10.5,
        alignment=1,
        textColor=colors.HexColor('#162052'),
        fontName='Helvetica-Bold'
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontSize=8.5,
        leading=11,
        alignment=1,
        textColor=colors.HexColor('#162052'),
        fontName='Helvetica-Bold'
    )

    cell_bold_style = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontSize=8,
        leading=10.5,
        textColor=colors.black,
        fontName='Helvetica-Bold'
    )

    cell_style = ParagraphStyle(
        'CellNormal',
        parent=styles['Normal'],
        fontSize=8,
        leading=10.5,
        textColor=colors.black,
        fontName='Helvetica'
    )

    body_text_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontSize=8,
        leading=11,
        textColor=colors.black,
        fontName='Helvetica',
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontSize=7.5,
        leading=10.5,
        textColor=colors.black,
        fontName='Helvetica',
        leftIndent=8,
        spaceAfter=3
    )

    law_footer_style = ParagraphStyle(
        'LawFooter',
        parent=styles['Normal'],
        fontSize=6.5,
        leading=8.5,
        textColor=colors.HexColor('#334155'),
        fontName='Helvetica'
    )

    story = []

    func = movimentacao.funcionario
    eq = movimentacao.equipamento

    # 1. Header with Official DIA Logo PNG
    logo_path = os.path.join(os.path.dirname(__file__), 'logo-dia.png')
    
    if os.path.exists(logo_path):
        img_logo = Image(logo_path, width=130, height=45)
        header_table_data = [
            [
                img_logo,
                [
                    Paragraph("<b>DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA</b>", company_banner_style),
                    Paragraph("DEPARTAMENTO DE TECNOLOGIA DA INFORMAÇÃO", company_sub_style)
                ]
            ]
        ]
        t_header = Table(header_table_data, colWidths=[140, 400])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (0,0), (0,0), 'LEFT'),
        ]))
        story.append(t_header)
    else:
        story.append(Paragraph("DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA", company_banner_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("TERMO DE RECEBIMENTO E RESPONSABILIDADE POR GUARDA E USO DE EQUIPAMENTOS POR COLABORADOR", title_style))
    story.append(Spacer(1, 4))
    
    # Legal note box
    legal_box_data = [[
        Paragraph("<b>conforme determinado em lei (Lei nº 10.261/68 - Artigo 241 p. IX - Artigo 245 p. II - Lei nº 709/93 Artigo 37 e Artigo 39), os equipamentos especificados neste termo de responsabilidade. Comprometendo-me a mantê-los em perfeito estado de conservação.</b>", legal_cite_style)
    ]]
    t_legal_box = Table(legal_box_data, colWidths=[540])
    t_legal_box.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#162052')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEF3C7')),
        ('PADDING', (0,0), (-1,-1), 4),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(t_legal_box)
    story.append(Spacer(1, 6))

    # Table 1: Tipo equipamento
    cat = eq.categoria or "Notebook"
    chk_desktop = "( X )" if cat in ["Desktop", "Notebook"] else "(   )"
    chk_impressora = "( X )" if cat == "Impressora" else "(   )"
    chk_outros = "( X )" if cat not in ["Desktop", "Notebook", "Impressora"] else "(   )"
    outros_txt = f" {cat} / {eq.tipo}" if cat not in ["Desktop", "Notebook", "Impressora"] else ""

    tipo_data = [
        [Paragraph("<b>Tipo equipamento</b>", table_header_style), "", ""],
        [
            Paragraph(f"{chk_desktop} Desktop/Notebook", cell_style),
            Paragraph(f"{chk_impressora} Impressora", cell_style),
            Paragraph(f"{chk_outros} Outros:{outros_txt}", cell_style)
        ]
    ]
    t_tipo = Table(tipo_data, colWidths=[180, 180, 180])
    t_tipo.setStyle(TableStyle([
        ('SPAN', (0,0), (2,0)),
        ('BACKGROUND', (0,0), (2,0), colors.HexColor('#FDE68A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_tipo)
    story.append(Spacer(1, 4))

    # Table 2: Dados do equipamento
    dados_eq = [
        [Paragraph("<b>Dados do equipamento</b>", table_header_style), "", ""],
        [Paragraph("Marca/Modelo", cell_bold_style), Paragraph("Nº de série (serial number)", cell_bold_style), Paragraph("Nº patrimônio", cell_bold_style)],
        [Paragraph(f"{eq.marca} / {eq.modelo}", cell_style), Paragraph(eq.numero_serie or "N/A", cell_style), Paragraph(eq.patrimonio, cell_style)]
    ]
    t_dados = Table(dados_eq, colWidths=[180, 180, 180])
    t_dados.setStyle(TableStyle([
        ('SPAN', (0,0), (2,0)),
        ('BACKGROUND', (0,0), (2,0), colors.HexColor('#FDE68A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_dados)
    story.append(Spacer(1, 4))

    # Table 3: Características
    caract_data = [
        [Paragraph("<b>Características do equipamento</b>", table_header_style), "", ""],
        [Paragraph("Processador", cell_bold_style), Paragraph("Memória", cell_bold_style), Paragraph("Tamanho do disco", cell_bold_style)],
        [Paragraph(eq.processador or "N/A", cell_style), Paragraph(eq.memoria or "N/A", cell_style), Paragraph(eq.tamanho_disco or "N/A", cell_style)]
    ]
    t_caract = Table(caract_data, colWidths=[180, 180, 180])
    t_caract.setStyle(TableStyle([
        ('SPAN', (0,0), (2,0)),
        ('BACKGROUND', (0,0), (2,0), colors.HexColor('#FDE68A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_caract)
    story.append(Spacer(1, 4))

    # Table 4: Softwares
    soft_data = [
        [Paragraph("<b>Softwares instalados</b>", table_header_style)],
        [Paragraph(f"<b>Sistema operacional:</b> {eq.sistema_operacional or 'Windows 11 Pro / Padrão Empresa'}", cell_style)]
    ]
    t_soft = Table(soft_data, colWidths=[540])
    t_soft.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#FDE68A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_soft)
    story.append(Spacer(1, 4))

    # Table 5: Acessórios
    acess = movimentacao.acessorios_inclusos or ""
    chk_fonte = "( X )" if "Fonte" in acess else "(   )"
    chk_cabo = "( X )" if "Cabo de rede" in acess else "(   )"
    chk_mouse = "( X )" if "Mouse" in acess else "(   )"
    chk_teclado = "( X )" if "Teclado" in acess else "(   )"
    chk_outros_acess = "( X )" if "Outros" in acess or "HDMI" in acess else "(   )"

    acess_data = [
        [Paragraph("<b>Acessórios</b>", table_header_style), "", ""],
        [
            Paragraph(f"{chk_fonte} Fonte de alimentação", cell_style),
            Paragraph(f"{chk_cabo} Cabo de rede", cell_style),
            Paragraph(f"{chk_mouse} Mouse", cell_style)
        ],
        [
            Paragraph(f"{chk_teclado} Teclado", cell_style),
            Paragraph(f"{chk_outros_acess} Outros (Cabo HDMI, Bolsa, etc.)", cell_style),
            ""
        ]
    ]
    t_acess = Table(acess_data, colWidths=[180, 180, 180])
    t_acess.setStyle(TableStyle([
        ('SPAN', (0,0), (2,0)),
        ('BACKGROUND', (0,0), (2,0), colors.HexColor('#FDE68A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_acess)
    story.append(Spacer(1, 4))

    # Observações de entrega
    cond = movimentacao.condicao_entrega or "USADO"
    chk_novo = "( X )" if cond == "NOVO" else "(   )"
    chk_usado = "( X )" if cond == "USADO" else "(   )"

    obs_data = [
        [Paragraph(f"<b>Observações:</b><br/>{chk_novo} equipamento novo.<br/>{chk_usado} equipamento usado, mas em perfeitas condições de uso.", cell_style)]
    ]
    t_obs = Table(obs_data, colWidths=[540])
    t_obs.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_obs)
    story.append(Spacer(1, 5))

    # Declaration text
    story.append(Paragraph(
        f"Eu <b>{func.nome.upper()}</b> CPF : <b>{func.cpf}</b> responsabilizo-me por eventuais danos causados diretamente à Administração ou a terceiros, decorrentes de minha culpa ou dolo, durante todo o período em que o(s) bem(ns) acima especificado(s) ficarem sob a minha guarda e utilização, conforme definido na Resolução e demais normas referentes ao trabalho, bem como declaro ciência das seguintes condições:",
        body_text_style
    ))

    # Bullets
    bullets = [
        "* O equipamento citado é cedido à título de empréstimo, sendo de propriedade da <b>DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA</b>;",
        "* Em caso de dano, inutilização, ou extravio do equipamento ( providenciar boletim de ocorrência policial e encaminhamento do mesmo ) deverei comunicar imediatamente ao setor competente, devendo esta avaliar o dano, se o mesmo pode ser reparado ou se o bem deverá ser tratado como inservível, bem como avaliar o valor a ser ressarcido;",
        "* Se o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa me fornecerá novo equipamento e cobrará o valor de um equipamento da mesma marca.",
        "* Não sendo mais necessário seu uso, ou nas situações de desligamento desta Autarquia, o equipamento deverá ser devolvido por completo e em perfeito estado de conservação, considerando-se o tempo do uso do mesmo (tempo de vida útil), ao setor competente.",
        "<b>Para equipamentos de informática:</b>",
        "* Poderá ser solicitada, a qualquer momento, a devolução temporária do equipamento para que a TI faça verificações e/ou atualizações de programas. Tão logo a ação seja finalizada o equipamento será devolvido;",
        "* Poderão ser utilizados neste equipamento apenas sistemas, programas ou qualquer tipo de aplicativos que estão em conformidade com as leis brasileiras, e previamente autorizados pela <b>DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA</b>;",
        "* Nenhuma alteração no hardware do equipamento poderá ser realizada sem o envolvimento da TI."
    ]

    for b in bullets:
        story.append(Paragraph(b, bullet_style))

    story.append(Spacer(1, 4))

    # Additional comments table
    comm_txt = movimentacao.comentarios_adicionais or "Nenhum comentário adicional."
    comm_data = [
        [Paragraph(f"<b>Comentários adicionais sobre o equipamento:</b><br/>{comm_txt}", cell_style)]
    ]
    t_comm = Table(comm_data, colWidths=[540])
    t_comm.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_comm)
    story.append(Spacer(1, 5))

    # Term signatures note
    story.append(Paragraph(
        "O presente termo será assinado pelo responsável pelo uso, pelo o gerente e pelo responsável pela TI, caso o equipamento seja de informática. Na ocasião de devolução do(s) bem(ns), o presente termo será baixado através do item \"Devolução\".",
        bullet_style
    ))
    story.append(Spacer(1, 4))

    data_atual = datetime.now().strftime("%d / %m / %Y")
    story.append(Paragraph(f"Recife, {data_atual}", cell_bold_style))
    story.append(Spacer(1, 18))

    # Signatures
    gerente = movimentacao.nome_gerente or "Gerente de Setor"
    ti_resp = movimentacao.nome_responsavel_ti or "Leidiane Silva - TI"

    sig_data = [
        [
            Paragraph("___________________________________<br/><b>Colaborador</b><br/>" + func.nome, ParagraphStyle('Sig1', parent=cell_style, alignment=1)),
            Paragraph("___________________________________<br/><b>Gerente</b><br/>" + gerente, ParagraphStyle('Sig2', parent=cell_style, alignment=1)),
            Paragraph("___________________________________<br/><b>TI</b><br/>" + ti_resp, ParagraphStyle('Sig3', parent=cell_style, alignment=1))
        ]
    ]
    t_sig = Table(sig_data, colWidths=[180, 180, 180])
    t_sig.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_sig)
    story.append(Spacer(1, 8))

    # Devolução Section Box
    dev_date = movimentacao.data_devolucao.strftime("%d / %m / %Y") if movimentacao.data_devolucao else "___ / ___ / ____"
    cond_dev = movimentacao.condicao_devolucao or ""
    chk_perfeito = "( X )" if cond_dev == "PERFEITO_ESTADO" else "(   )"
    chk_defeito = "( X )" if cond_dev == "DEFEITO" else "(   )"
    chk_faltando = "( X )" if cond_dev == "FALTANDO_PECAS" else "(   )"

    dev_content = [
        [Paragraph("<b>Devolução</b>", table_header_style)],
        [Paragraph(f"Atestamos que o equipamento foi devolvido em {dev_date}, nas seguintes condições:<br/>"
                   f"{chk_perfeito} Em perfeito estado;<br/>"
                   f"{chk_defeito} Apresentando defeito;<br/>"
                   f"{chk_faltando} Faltando peças ou acessórios. Citar: {movimentacao.observacoes_devolucao or ''}<br/><br/>"
                   f"<b>Devolução:</b> {dev_date}<br/>"
                   f"<b>Nome do responsável pelo recebimento:</b> __________________________________________<br/>"
                   f"<b>Setor do responsável pelo recebimento:</b> ___________________________________________<br/><br/>"
                   f"<b>Assinatura:</b> ____________________________________________________________________", cell_style)]
    ]
    t_dev = Table(dev_content, colWidths=[540])
    t_dev.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#FDE68A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#162052')),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_dev)
    story.append(Spacer(1, 6))

    # Laws footer text
    story.append(Paragraph(
        "<b>Lei nº 10.261/68</b> - Artigo 241 – São deveres do funcionário: IX – Zelar pela economia do material do Estado e pela conservação do que for confiado à sua guarda, ou utilização; Artigo 245 – O funcionário é responsável... II – Pelas faltas, danos, avarias e quaisquer outros prejuízos que sofrerem os bens e os materiais sob sua guarda, ou sujeitos a seu exame ou fiscalização;<br/>"
        "<b>Lei nº 709/93</b> - Artigo 37 – Quando se verificar que determinada conta não foi prestada, que ocorreu desfalque, desvio de bens ou valores públicos ou outra irregularidade de que resulte dano ao erário, as autoridades administrativas, sob pena de responsabilidade e sem prejuízo dos procedimentos disciplinares, deverão tomar imediatas providências para assegurar o respectivo ressarcimento e instaurar, desde logo, a tomada de contas, comunicando o fato ao Tribunal de Contas, no prazo de 03 (três) dias (g.n.); Artigo 39 – Responderá pelos prejuízos que causar ao erário o ordenador da despesa, o responsável pela guarda dos bens e valores públicos ou aquele que autorizar ou der causa direta ao gasto irregular.",
        law_footer_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
