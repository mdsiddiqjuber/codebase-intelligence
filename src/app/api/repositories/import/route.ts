import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const githubUrl = body.githubUrl;

    if (!githubUrl) {
      return NextResponse.json(
        { error: "GitHub URL is required" },
        { status: 400 }
      );
    }

    const url = new URL(githubUrl);

    if (url.hostname !== "github.com") {
      return NextResponse.json(
        { error: "Please provide a valid GitHub repository URL" },
        { status: 400 }
      );
    }

    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const owner = parts[0];
    const repo = parts[1].replace(".git", "");

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    if (!githubResponse.ok) {
      return NextResponse.json(
        { error: "GitHub repository not found" },
        { status: 404 }
      );
    }

    const githubData = await githubResponse.json();

    const { data, error } = await supabase
      .from("repositories")
      .insert({
        name: githubData.name,
        github_url: githubData.html_url,
        owner: githubData.owner.login,
        default_branch: githubData.default_branch,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: "Failed to save repository" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Repository imported successfully",
      repository: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}