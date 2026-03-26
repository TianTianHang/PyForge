use crate::models::template::{PyProjectToml, Template};

const DATA_SCIENCE: &str = include_str!("../../templates/data-science.toml");
const MACHINE_LEARNING: &str = include_str!("../../templates/machine-learning.toml");
const WEB_DEVELOPMENT: &str = include_str!("../../templates/web-development.toml");
const GENERAL_LEARNING: &str = include_str!("../../templates/general-learning.toml");

pub fn parse_template(content: &str) -> Result<Template, String> {
    let pyproject: PyProjectToml =
        toml::from_str(content).map_err(|e| format!("解析模板 TOML 失败: {}", e))?;

    let python_version = extract_python_version(&pyproject.project.requires_python);

    Ok(Template {
        id: pyproject.project.name.clone(),
        display_name: if pyproject.tool.pyforge.display_name.is_empty() {
            pyproject.project.name.clone()
        } else {
            pyproject.tool.pyforge.display_name
        },
        description: pyproject.project.description.unwrap_or_default(),
        icon: pyproject.tool.pyforge.icon,
        dependencies: pyproject.project.dependencies,
        use_cases: pyproject.tool.pyforge.use_cases,
        requires_python: python_version,
    })
}

pub fn extract_python_version(requires_python: &Option<String>) -> String {
    match requires_python {
        None => "3.12".to_string(),
        Some(spec) => {
            let cleaned = spec.trim_start_matches(['=', '>', '<', '~', '!']);
            let base: String = cleaned
                .chars()
                .take_while(|c| c.is_ascii_digit() || *c == '.')
                .collect();
            if base.is_empty() || !base.contains('.') {
                "3.12".to_string()
            } else {
                base
            }
        }
    }
}

pub fn get_builtin_templates() -> Result<Vec<Template>, String> {
    let mut templates = Vec::new();

    for content in [
        DATA_SCIENCE,
        MACHINE_LEARNING,
        WEB_DEVELOPMENT,
        GENERAL_LEARNING,
    ] {
        templates.push(parse_template(content)?);
    }

    templates.sort_by(|a, b| {
        if a.id == "general-learning" {
            std::cmp::Ordering::Greater
        } else if b.id == "general-learning" {
            std::cmp::Ordering::Less
        } else {
            a.id.cmp(&b.id)
        }
    });

    Ok(templates)
}

pub fn get_template_by_id(template_id: &str) -> Result<Template, String> {
    let templates = get_builtin_templates()?;
    templates
        .into_iter()
        .find(|t| t.id == template_id)
        .ok_or_else(|| format!("模板不存在: {}", template_id))
}
