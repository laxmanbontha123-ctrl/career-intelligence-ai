import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const MAX_AVATAR_BYTES = 700 * 1024;
const AVATAR_PATTERN =
  /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;

type ProfileBody = Record<string, unknown>;

function optionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function nullableNumber(value: unknown) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  return Number(value);
}

function normalizeContactPhone(value: unknown) {
  const raw = optionalText(value);

  if (!raw) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");

  const localNumber =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits;

  if (!/^[6-9]\d{9}$/.test(localNumber)) {
    return undefined;
  }

  return `+91${localNumber}`;
}

function getAvatarSize(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const padding =
    base64.match(/=*$/)?.[0].length ?? 0;

  return Math.floor((base64.length * 3) / 4) - padding;
}

function validateAvatar(value: unknown) {
  if (
    value === null ||
    value === "" ||
    value === undefined
  ) {
    return {
      valid: true,
      avatarDataUrl: null as string | null,
      message: "",
    };
  }

  if (
    typeof value !== "string" ||
    !AVATAR_PATTERN.test(value)
  ) {
    return {
      valid: false,
      avatarDataUrl: null,
      message:
        "Profile image must be a PNG, JPEG or WebP image.",
    };
  }

  if (getAvatarSize(value) > MAX_AVATAR_BYTES) {
    return {
      valid: false,
      avatarDataUrl: null,
      message:
        "Profile image must be smaller than 700 KB.",
    };
  }

  return {
    valid: true,
    avatarDataUrl: value,
    message: "",
  };
}

async function profileResponse(
  userId: number,
  message?: string
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      learnerProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "User profile was not found.",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message,
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      authMethod: user.authMethod,
      avatarDataUrl: user.avatarDataUrl,
      targetRole: user.targetRole,
      readinessScore: user.readinessScore,
      profileCompleted: user.profileCompleted,
      learnerProfile: user.learnerProfile,
    },
  });
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    return profileResponse(session.userId);
  } catch (error) {
    console.error("Profile load error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load your profile.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ProfileBody;

    const institution = optionalText(body.institution);
    const degree = optionalText(body.degree);
    const branch = optionalText(body.branch);
    const targetRole = optionalText(body.targetRole);
    const currentYear = nullableNumber(body.currentYear);
    const cgpa = nullableNumber(body.cgpa);
    const graduationYear = nullableNumber(
      body.graduationYear
    );

    const contactPhone = normalizeContactPhone(
      body.contactPhone
    );

    if (contactPhone === undefined) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    if (
      !institution ||
      !degree ||
      !branch ||
      !targetRole ||
      currentYear === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please complete all required fields.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(currentYear) ||
      currentYear < 1 ||
      currentYear > 6
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Current year must be between 1 and 6.",
        },
        { status: 400 }
      );
    }

    if (
      cgpa !== null &&
      (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "CGPA must be between 0 and 10.",
        },
        { status: 400 }
      );
    }

    if (
      graduationYear !== null &&
      (!Number.isInteger(graduationYear) ||
        graduationYear < 2000 ||
        graduationYear > 2100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Graduation year is invalid.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.learnerProfile.upsert({
        where: {
          userId: session.userId,
        },
        update: {
          institution,
          degree,
          branch,
          currentYear,
          cgpa,
          graduationYear,
          experienceLevel: optionalText(
            body.experienceLevel
          ),
          preferredWorkMode: optionalText(
            body.preferredWorkMode
          ),
          location: optionalText(body.location),
          contactPhone,
          bio: optionalText(body.bio),
        },
        create: {
          userId: session.userId,
          institution,
          degree,
          branch,
          currentYear,
          cgpa,
          graduationYear,
          experienceLevel: optionalText(
            body.experienceLevel
          ),
          preferredWorkMode: optionalText(
            body.preferredWorkMode
          ),
          location: optionalText(body.location),
          contactPhone,
          bio: optionalText(body.bio),
        },
      }),

      prisma.user.update({
        where: {
          id: session.userId,
        },
        data: {
          targetRole,
          profileCompleted: true,
        },
      }),
    ]);

    return profileResponse(
      session.userId,
      "Learner profile completed successfully."
    );
  } catch (error) {
    console.error("Profile save error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save learner profile.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ProfileBody;

    const existing = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      include: {
        learnerProfile: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "User profile was not found.",
        },
        { status: 404 }
      );
    }

    const name =
      body.name === undefined
        ? existing.name
        : optionalText(body.name);

    if (
      body.name !== undefined &&
      (!name || name.length < 2 || name.length > 80)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name must contain between 2 and 80 characters.",
        },
        { status: 400 }
      );
    }

    let avatarDataUrl = existing.avatarDataUrl;

    if (body.avatarDataUrl !== undefined) {
      const avatarResult = validateAvatar(
        body.avatarDataUrl
      );

      if (!avatarResult.valid) {
        return NextResponse.json(
          {
            success: false,
            message: avatarResult.message,
          },
          { status: 400 }
        );
      }

      avatarDataUrl = avatarResult.avatarDataUrl;
    }

    const currentYear =
      body.currentYear === undefined
        ? existing.learnerProfile?.currentYear ?? null
        : nullableNumber(body.currentYear);

    const cgpa =
      body.cgpa === undefined
        ? existing.learnerProfile?.cgpa ?? null
        : nullableNumber(body.cgpa);

    const graduationYear =
      body.graduationYear === undefined
        ? existing.learnerProfile?.graduationYear ?? null
        : nullableNumber(body.graduationYear);

    if (
      currentYear !== null &&
      (!Number.isInteger(currentYear) ||
        currentYear < 1 ||
        currentYear > 6)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Current year must be between 1 and 6.",
        },
        { status: 400 }
      );
    }

    if (
      cgpa !== null &&
      (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "CGPA must be between 0 and 10.",
        },
        { status: 400 }
      );
    }

    if (
      graduationYear !== null &&
      (!Number.isInteger(graduationYear) ||
        graduationYear < 2000 ||
        graduationYear > 2100)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Graduation year is invalid.",
        },
        { status: 400 }
      );
    }

    const currentProfile = existing.learnerProfile;

    const institution =
      body.institution === undefined
        ? currentProfile?.institution ?? null
        : optionalText(body.institution);

    const degree =
      body.degree === undefined
        ? currentProfile?.degree ?? null
        : optionalText(body.degree);

    const branch =
      body.branch === undefined
        ? currentProfile?.branch ?? null
        : optionalText(body.branch);

    const experienceLevel =
      body.experienceLevel === undefined
        ? currentProfile?.experienceLevel ?? null
        : optionalText(body.experienceLevel);

    const preferredWorkMode =
      body.preferredWorkMode === undefined
        ? currentProfile?.preferredWorkMode ?? null
        : optionalText(body.preferredWorkMode);

    const location =
      body.location === undefined
        ? currentProfile?.location ?? null
        : optionalText(body.location);

    const bio =
      body.bio === undefined
        ? currentProfile?.bio ?? null
        : optionalText(body.bio);

    const contactPhoneInput =
      body.contactPhone === undefined
        ? currentProfile?.contactPhone ?? null
        : body.contactPhone;

    const contactPhone = normalizeContactPhone(
      contactPhoneInput
    );

    if (contactPhone === undefined) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid 10-digit Indian mobile number.",
        },
        { status: 400 }
      );
    }

    const targetRole =
      body.targetRole === undefined
        ? existing.targetRole
        : optionalText(body.targetRole);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: session.userId,
        },
        data: {
          name,
          avatarDataUrl,
          targetRole,
        },
      }),

      prisma.learnerProfile.upsert({
        where: {
          userId: session.userId,
        },
        update: {
          institution,
          degree,
          branch,
          currentYear,
          cgpa,
          graduationYear,
          experienceLevel,
          preferredWorkMode,
          location,
          contactPhone,
          bio,
        },
        create: {
          userId: session.userId,
          institution,
          degree,
          branch,
          currentYear,
          cgpa,
          graduationYear,
          experienceLevel,
          preferredWorkMode,
          location,
          contactPhone,
          bio,
        },
      }),
    ]);

    return profileResponse(
      session.userId,
      "Profile updated successfully."
    );
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your profile.",
      },
      { status: 500 }
    );
  }
}
