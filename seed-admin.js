db.users.updateOne(
  { email: "diliprbtech24@rvu.edu.in" },
  {
    $set: {
      name: "dil",
      email: "diliprbtech24@rvu.edu.in",
      password: "$2b$12$u.FIDLG6GCmzsFomAcK88efSrMbpGRM.xhz0VqroxeMOA21YjgAV2",
      college: "Admin Portal",
      role: "ADMIN",
      streakDays: 0,
      totalPoints: 0,
      earnedBadges: [],
      joinedAt: new Date(),
      lastLoginAt: new Date()
    }
  },
  { upsert: true }
);
printjson(db.users.findOne({ email: "diliprbtech24@rvu.edu.in" }, { _id: 0, name: 1, email: 1, role: 1 }));
