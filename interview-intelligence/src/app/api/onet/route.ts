import { NextRequest, NextResponse } from "next/server";
import {
  searchOccupations,
  getOccupationDetails,
  getCompetenciesForPosition,
  generateCompetencyQuestions,
} from "@/lib/onet/onetService";

/**
 * O*NET API Integration
 *
 * Provides access to occupational competency data from O*NET
 * for evidence-based interview assessment.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const query = searchParams.get("query") || "";

    switch (action) {
      case "search": {
        // Search for occupations by keyword
        if (!query) {
          return NextResponse.json({ error: "Query required" }, { status: 400 });
        }
        const occupations = await searchOccupations(query);
        return NextResponse.json({ occupations });
      }

      case "details": {
        // Get detailed occupation data by SOC code
        const code = searchParams.get("code");
        if (!code) {
          return NextResponse.json({ error: "Code required" }, { status: 400 });
        }
        const details = await getOccupationDetails(code);
        if (!details) {
          return NextResponse.json({ error: "Occupation not found" }, { status: 404 });
        }
        return NextResponse.json(details);
      }

      case "competencies": {
        // Get competencies for a position
        if (!query) {
          return NextResponse.json({ error: "Position query required" }, { status: 400 });
        }
        const result = await getCompetenciesForPosition(query);
        return NextResponse.json(result);
      }

      case "questions": {
        // Generate interview questions based on competencies
        const competencies = searchParams.get("competencies")?.split(",") || [];
        if (competencies.length === 0) {
          return NextResponse.json(
            { error: "Competencies required" },
            { status: 400 }
          );
        }
        const questions = generateCompetencyQuestions(competencies);
        return NextResponse.json({ questions });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: search, details, competencies, or questions" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("O*NET API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, position, competencies } = body;

    switch (action) {
      case "getCompetencies": {
        if (!position) {
          return NextResponse.json({ error: "Position required" }, { status: 400 });
        }
        const result = await getCompetenciesForPosition(position);
        return NextResponse.json(result);
      }

      case "generateQuestions": {
        if (!competencies || !Array.isArray(competencies)) {
          return NextResponse.json(
            { error: "Competencies array required" },
            { status: 400 }
          );
        }
        const questions = generateCompetencyQuestions(competencies);
        return NextResponse.json({ questions });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("O*NET API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
