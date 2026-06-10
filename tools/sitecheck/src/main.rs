//! sitecheck — build-time QA for the PHX static site.
//!
//! Usage: sitecheck <site-dir> [--base-url <url>] [--write-sitemap]
//!
//! 1. Walks every .html file under <site-dir>.
//! 2. Verifies that every root-relative href/src ("/...") resolves to a file
//!    in the site tree (directories must contain index.html).
//! 3. Verifies required head tags: <title>, meta description, canonical
//!    (404.html is exempt from canonical).
//! 4. With --write-sitemap, regenerates sitemap.xml from indexable pages.
//!
//! Std-only on purpose: it must compile offline, anywhere, forever.

use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

fn collect_html(dir: &Path, out: &mut Vec<PathBuf>) {
    let entries = match fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            collect_html(&path, out);
        } else if path.extension().is_some_and(|e| e == "html") {
            out.push(path);
        }
    }
}

/// Extract values of href="..." and src="..." attributes. A tolerant
/// scanner, not an HTML parser — fine for machine-written pages.
fn extract_refs(html: &str) -> Vec<String> {
    let mut refs = Vec::new();
    for attr in ["href=\"", "src=\""] {
        let mut rest = html;
        while let Some(idx) = rest.find(attr) {
            rest = &rest[idx + attr.len()..];
            if let Some(end) = rest.find('"') {
                refs.push(rest[..end].to_string());
                rest = &rest[end..];
            } else {
                break;
            }
        }
    }
    refs
}

fn is_internal(r: &str) -> bool {
    r.starts_with('/') && !r.starts_with("//")
}

fn resolves(site: &Path, reference: &str) -> bool {
    // Strip query string and fragment.
    let clean = reference
        .split('#')
        .next()
        .unwrap_or("")
        .split('?')
        .next()
        .unwrap_or("");
    let rel = clean.trim_start_matches('/');
    let target = site.join(rel);
    if clean.ends_with('/') || rel.is_empty() {
        target.join("index.html").is_file()
    } else {
        target.is_file() || target.join("index.html").is_file()
    }
}

fn head_check(path: &Path, html: &str, errors: &mut Vec<String>) {
    let name = path.display();
    if !html.contains("<title>") {
        errors.push(format!("{name}: missing <title>"));
    }
    if !html.contains("name=\"description\"") {
        errors.push(format!("{name}: missing meta description"));
    }
    let is_404 = path.file_name().is_some_and(|f| f == "404.html");
    if !is_404 && !html.contains("rel=\"canonical\"") {
        errors.push(format!("{name}: missing canonical link"));
    }
    if !html.contains("name=\"viewport\"") {
        errors.push(format!("{name}: missing viewport meta"));
    }
}

fn page_url(site: &Path, page: &Path, base: &str) -> Option<String> {
    let rel = page.strip_prefix(site).ok()?;
    let mut url = rel.to_string_lossy().replace('\\', "/");
    if url == "404.html" {
        return None; // not indexable
    }
    if url.ends_with("index.html") {
        url.truncate(url.len() - "index.html".len());
    }
    Some(format!("{}/{}", base.trim_end_matches('/'), url))
}

fn write_sitemap(site: &Path, pages: &[PathBuf], base: &str) -> std::io::Result<()> {
    let mut urls: Vec<String> = pages
        .iter()
        .filter_map(|p| page_url(site, p, base))
        .collect();
    urls.sort();
    let mut xml = String::from("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
    for url in &urls {
        xml.push_str(&format!("  <url><loc>{url}</loc></url>\n"));
    }
    xml.push_str("</urlset>\n");
    fs::write(site.join("sitemap.xml"), xml)?;
    println!("sitemap.xml written with {} URLs", urls.len());
    Ok(())
}

fn main() -> ExitCode {
    let args: Vec<String> = env::args().skip(1).collect();
    if args.is_empty() {
        eprintln!("usage: sitecheck <site-dir> [--base-url <url>] [--write-sitemap]");
        return ExitCode::from(2);
    }
    let site = PathBuf::from(&args[0]);
    let mut base_url = String::from("https://phxindia.com");
    let mut do_sitemap = false;
    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            "--base-url" if i + 1 < args.len() => {
                base_url = args[i + 1].clone();
                i += 2;
            }
            "--write-sitemap" => {
                do_sitemap = true;
                i += 1;
            }
            other => {
                eprintln!("unknown argument: {other}");
                return ExitCode::from(2);
            }
        }
    }

    if !site.is_dir() {
        eprintln!("error: {} is not a directory", site.display());
        return ExitCode::from(2);
    }

    let mut pages = Vec::new();
    collect_html(&site, &mut pages);
    pages.sort();
    if pages.is_empty() {
        eprintln!("error: no .html files found under {}", site.display());
        return ExitCode::from(2);
    }

    let mut errors: Vec<String> = Vec::new();
    let mut checked_refs = 0usize;

    for page in &pages {
        let html = match fs::read_to_string(page) {
            Ok(s) => s,
            Err(e) => {
                errors.push(format!("{}: unreadable ({e})", page.display()));
                continue;
            }
        };
        head_check(page, &html, &mut errors);
        for reference in extract_refs(&html) {
            if is_internal(&reference) {
                checked_refs += 1;
                if !resolves(&site, &reference) {
                    errors.push(format!("{}: broken internal ref {}", page.display(), reference));
                }
            }
        }
    }

    println!(
        "checked {} pages, {} internal references",
        pages.len(),
        checked_refs
    );

    if do_sitemap {
        if let Err(e) = write_sitemap(&site, &pages, &base_url) {
            errors.push(format!("sitemap: {e}"));
        }
    }

    if errors.is_empty() {
        println!("OK — no broken links, all required tags present");
        ExitCode::SUCCESS
    } else {
        for e in &errors {
            eprintln!("FAIL {e}");
        }
        eprintln!("{} problem(s) found", errors.len());
        ExitCode::FAILURE
    }
}
