const { dataSource } = require("../db/data-source");
const appError = require("../util/appError");
const { isValidString } = require("../util/validation");

const skillController = {
  async getSkills(req, res, next) {
    try {
    const skills = await dataSource.getRepository('Skill').find({
      select: { id: true, name: true },
      order: { name: 'ASC' },
    });
    res.json({ status: 'success', data: skills });
    return;
    } catch (error) {
      console.error(`這裏出錯了：${error}`);
      next(error);
    }
  },

  async postSkill(req, res, next) {
    const { name } = req.body;
    if (!isValidString(name)) {
      next(appError(400, '技能名稱未填寫正確'));
      return;
    }
    const skillRepo = dataSource.getRepository('Skill');
    const existing = await skillRepo.findOneBy({ name: name.trim() });
    if (existing) {
      next(appError(409, '技能名稱已存在'));
      return;
    }
    const skill = await skillRepo.save({ name: name.trim() });
    res.json({ status: 'success', data: skill });
  },

  async deleteSkill(req, res, next) {
    try {
      const { skillId } = req.params;
      const result = await dataSource.getRepository('Skill').delete(skillId);
      if (result.affected === 0) {
        next(appError(400, '技能ID錯誤--查無資料'));
        return;
      }
      res.json({ status: 'success' });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
};

module.exports = skillController;
